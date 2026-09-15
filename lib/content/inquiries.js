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
//
// submitInquiryAction shows a thrown error's .message straight to whoever
// submitted the form — safe for Blob (every error it ever threw was a
// message we wrote ourselves), not safe for a raw Postgres error, which
// can describe schema/internals. Catching here and re-throwing a generic
// message keeps that call site's `err.message` blind trust intact while
// the real error still reaches Vercel's logs.
export async function addInquiry(fields) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'new',
    submittedAt: new Date().toISOString(),
    ...fields,
  }
  const sql = db()
  try {
    // Pass the plain object, not JSON.stringify(record) — see the comment
    // on addStudent in lib/content/students.js for why: a pre-stringified
    // value here gets serialized a second time, double-encoding the column.
    await sql`INSERT INTO inquiries (id, data) VALUES (${record.id}, ${record}::jsonb)`
  } catch (err) {
    console.error('addInquiry failed:', err)
    throw new Error('Could not submit. Please try again.')
  }
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

// Cheap "did anything change" check for AutoRefresh's poll — a count plus
// the latest submission time, not the full jsonb rows getInquiries()
// returns. Polling this often is fine; it's the thing that decides whether
// a real (comparatively expensive) getInquiries() refetch is worth doing.
export async function getInquiriesFingerprint() {
  if (!isDbConfigured) return null
  try {
    const sql = db()
    const rows = await sql`SELECT count(*)::int AS count, max(data->>'submittedAt') AS latest FROM inquiries`
    return { count: rows[0]?.count ?? 0, latest: rows[0]?.latest ?? null }
  } catch (err) {
    console.error('getInquiriesFingerprint failed:', err)
    return null
  }
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
