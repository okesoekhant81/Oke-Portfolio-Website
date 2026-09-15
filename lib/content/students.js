import { db, isDbConfigured } from '../db'

// Students live in Postgres, not Blob (see lib/db.js) — this is the actual
// PII this app handles (name, email, phone, payment info), unlike the
// content JSON files that stayed on Blob. One row per student, id as the
// primary key, the record itself as jsonb — same loose shape the Blob
// version used, so every function below keeps its original signature and
// return shape and no caller (app/actions/students.js, registrantEmail.js,
// the certificate page, CSV export, capacity checks, ...) needed to change.

// Reads are wrapped in try/catch and fail safe to [] — a transient
// connection hiccup here used to be impossible to hit (Blob's readJson
// already swallowed its own failures), so nothing downstream expects this
// to ever throw. Logged via console.error so the actual error still shows
// up in Vercel's function logs instead of silently vanishing.
export async function getStudents({ includeDeleted = false } = {}) {
  if (!isDbConfigured) return []
  try {
    const sql = db()
    const rows = includeDeleted
      ? await sql`SELECT id, data FROM students ORDER BY data->>'createdAt' DESC`
      : await sql`SELECT id, data FROM students WHERE data->>'deletedAt' IS NULL ORDER BY data->>'createdAt' DESC`
    // `id` always comes from the primary key column, not data->>'id' — any
    // record whose stored JSON is missing (or ever ends up missing) its own
    // id would otherwise render as `undefined`, crashing every admin view
    // that calls .toUpperCase() on it. The primary key is always correct:
    // it's what every write here keys on.
    return rows.map((r) => ({ ...r.data, id: r.id }))
  } catch (err) {
    console.error('getStudents failed:', err)
    return []
  }
}

// No admin auth check — reachable only through /admin/students, which
// proxy.js gates, same pattern as inquiries/classDates.
export async function addStudent(fields) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    classDate: '',
    paymentStatus: 'unpaid',
    paymentNote: '',
    amountPaid: 0,
    attendance: [],
    sourceInquiryId: null,
    ...fields,
  }
  const sql = db()
  // Pass the plain object, not JSON.stringify(record) — postgres.js infers
  // this parameter's type as jsonb from the `::jsonb` cast and serializes
  // it exactly once. Passing an already-stringified value here double-
  // encodes it (the column ends up holding a jsonb *string* containing
  // escaped JSON text, not a jsonb *object* — confirmed via
  // testJsonbEncodingAction in app/actions/dbDiagnostic.js), which is what
  // caused every field except id to disappear the first time this shipped.
  await sql`INSERT INTO students (id, data) VALUES (${record.id}, ${record}::jsonb)`
  return record
}

// `data || patch::jsonb` is a shallow jsonb merge with the right-hand side
// winning on shared keys — the same semantics as the old `{ ...s, ...patch }`
// Blob version, and a single atomic statement, so no read-modify-write race
// is possible the way it was for Blob (mutateJson's whole reason for
// existing).
export async function updateStudent(id, patch) {
  const sql = db()
  await sql`UPDATE students SET data = data || ${patch}::jsonb WHERE id = ${id}`
}

// Soft-delete — sets deletedAt instead of removing the record, so it's
// recoverable through the Trash view (see app/admin/trash) rather than
// gone the instant someone clicks Remove. permanentlyDeleteStudent is the
// old hard-delete behavior, only reachable from Trash itself.
export async function deleteStudent(id) {
  await updateStudent(id, { deletedAt: new Date().toISOString() })
}

export async function restoreStudent(id) {
  await updateStudent(id, { deletedAt: null })
}

export async function permanentlyDeleteStudent(id) {
  const sql = db()
  await sql`DELETE FROM students WHERE id = ${id}`
}

export async function getStudent(id, { includeDeleted = false } = {}) {
  const students = await getStudents({ includeDeleted })
  return students.find((s) => s.id === id) || null
}

function upsertAttendance(attendance, date, present, note) {
  const list = attendance || []
  const idx = list.findIndex((a) => a.date === date)
  const entry = {
    id: idx >= 0 ? list[idx].id : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    present,
    note: note || '',
  }
  return idx >= 0 ? list.map((a, i) => (i === idx ? entry : a)) : [...list, entry]
}

// Attendance lives nested inside the student's own jsonb, so unlike
// updateStudent above this can't be a single atomic statement — it has to
// read the current array, compute the new one in JS (upsertAttendance),
// then write it back. `FOR UPDATE` inside a transaction locks the row for
// the duration, so two attendance edits landing close together serialize
// instead of racing the way a plain read-then-write would.
export async function setAttendance(studentId, date, present, note) {
  const sql = db()
  await sql.begin(async (tx) => {
    const rows = await tx`SELECT data FROM students WHERE id = ${studentId} FOR UPDATE`
    const current = rows[0]?.data
    if (!current) return
    const attendance = upsertAttendance(current.attendance, date, present, note)
    await tx`UPDATE students SET data = jsonb_set(data, '{attendance}', ${attendance}::jsonb) WHERE id = ${studentId}`
  })
}

export async function deleteAttendanceEntry(studentId, entryId) {
  const sql = db()
  await sql.begin(async (tx) => {
    const rows = await tx`SELECT data FROM students WHERE id = ${studentId} FOR UPDATE`
    const current = rows[0]?.data
    if (!current) return
    const attendance = (current.attendance || []).filter((a) => a.id !== entryId)
    await tx`UPDATE students SET data = jsonb_set(data, '{attendance}', ${attendance}::jsonb) WHERE id = ${studentId}`
  })
}

// Attendance for a whole class in one save — each affected student's row
// is locked and updated within the same transaction, so this can't
// interleave with a single-student attendance edit landing at the same
// time either.
export async function setAttendanceForClass(date, records) {
  const byStudent = new Map(records.map((r) => [r.studentId, r]))
  const sql = db()
  await sql.begin(async (tx) => {
    for (const [studentId, record] of byStudent) {
      const rows = await tx`SELECT data FROM students WHERE id = ${studentId} FOR UPDATE`
      const current = rows[0]?.data
      if (!current) continue
      const attendance = upsertAttendance(current.attendance, date, record.present, record.note)
      await tx`UPDATE students SET data = jsonb_set(data, '{attendance}', ${attendance}::jsonb) WHERE id = ${studentId}`
    }
  })
}
