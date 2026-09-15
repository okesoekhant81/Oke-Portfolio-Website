import { db, isDbConfigured } from '../db'

// Inquiries live in Postgres, not Blob — same reasoning as students.js:
// this is PII (name, email, phone, payment proof), not general site
// content. One row per inquiry, id as the primary key, the record itself
// as jsonb, same loose shape the Blob version used — every function below
// keeps its original signature and return shape, so no caller needed to
// change.

// Wrapped in try/catch and fails safe to [] — same reasoning as
// getStudents in students.js: Blob's readJson never threw, so nothing
// downstream expects this to. Logged via console.error so the real error
// still surfaces in Vercel's function logs.
export async function getInquiries() {
  if (!isDbConfigured) return []
  try {
    const sql = db()
    const rows = await sql`SELECT id, data FROM inquiries ORDER BY data->>'submittedAt' DESC`
    // `id` always comes from the primary key column, not data->>'id' — a
    // handful of records that predate this app tracking an id inside the
    // record itself (or any other historical gap in the stored JSON) would
    // otherwise render as `undefined`, crashing every admin view that
    // calls .toUpperCase() on it. The primary key is always correct: it's
    // what every write here keys on.
    return rows.map((r) => ({ ...r.data, id: r.id }))
  } catch (err) {
    console.error('getInquiries failed:', err)
    return []
  }
}

// Public — reachable from the unauthenticated /workshop registration form
// via submitInquiryAction (see app/actions/inquiries.js), which does its
// own input validation and abuse defenses; this just persists whatever it
// was handed.
export async function addInquiry(fields) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'new',
    submittedAt: new Date().toISOString(),
    ...fields,
  }
  const sql = db()
  // Pass the plain object, not JSON.stringify(record) — see the comment on
  // addStudent in lib/content/students.js for why: a pre-stringified value
  // here gets serialized a second time, double-encoding the column.
  await sql`INSERT INTO inquiries (id, data) VALUES (${record.id}, ${record}::jsonb)`
  return record
}

// `data || patch::jsonb` shallow-merges with the right-hand side winning on
// shared keys — same semantics as the old Blob version's `{ ...inquiry, status }`,
// as a single atomic statement instead of a read-modify-write.
export async function setInquiryStatus(id, status) {
  const sql = db()
  await sql`UPDATE inquiries SET data = data || ${{ status }}::jsonb WHERE id = ${id}`
}

export async function deleteInquiry(id) {
  const sql = db()
  await sql`DELETE FROM inquiries WHERE id = ${id}`
}

export async function deleteInquiries(ids) {
  if (ids.length === 0) return
  const sql = db()
  await sql`DELETE FROM inquiries WHERE id IN ${sql(ids)}`
}

export async function setInquiriesStatus(ids, status) {
  if (ids.length === 0) return
  const sql = db()
  await sql`UPDATE inquiries SET data = data || ${{ status }}::jsonb WHERE id IN ${sql(ids)}`
}

export async function getInquiry(id) {
  if (!isDbConfigured) return null
  try {
    const sql = db()
    const rows = await sql`SELECT id, data FROM inquiries WHERE id = ${id}`
    if (!rows[0]) return null
    return { ...rows[0].data, id: rows[0].id }
  } catch (err) {
    console.error('getInquiry failed:', err)
    return null
  }
}

// Set once an inquiry has been converted into a student roster entry
// (see app/actions/students.js) — the inquiry itself is left in place as
// the original registration record, this just marks it so the admin view
// doesn't offer to convert the same one twice.
export async function markInquiryConverted(id, studentId) {
  const sql = db()
  await sql`UPDATE inquiries SET data = data || ${{ studentId }}::jsonb WHERE id = ${id}`
}
