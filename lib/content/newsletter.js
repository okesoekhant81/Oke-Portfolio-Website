import { db, isDbConfigured } from '../db'

// Subscriber emails live in Postgres, not Blob — same PII reasoning as
// students.js/inquiries.js/adminUsers.js. Unlike those, a subscriber has
// no separate id: the email itself is the natural primary key, so
// dedup is a database constraint (ON CONFLICT DO NOTHING) instead of the
// old Blob version's read-the-whole-list-and-check-in-JS approach.

export async function getSubscribers() {
  if (!isDbConfigured) return []
  try {
    const sql = db()
    const rows = await sql`SELECT data FROM newsletter_subscribers ORDER BY data->>'subscribedAt' ASC`
    return rows.map((r) => r.data)
  } catch (err) {
    console.error('getSubscribers failed:', err)
    return []
  }
}

// Silently no-ops on a duplicate email rather than erroring — someone
// submitting the form twice (double-click, or genuinely re-subscribing)
// should just see the same success state either time, not a "you're
// already on the list" error that leaks whether an address is registered.
//
// subscribeNewsletterAction shows a thrown error's .message straight to
// whoever submitted the form — safe for Blob, not for a raw Postgres
// error. Caught here and re-thrown generic, same reasoning as addInquiry
// in lib/content/inquiries.js.
export async function addSubscriber(email) {
  const normalized = email.trim().toLowerCase()
  const sql = db()
  const record = { email: normalized, subscribedAt: new Date().toISOString() }
  try {
    // Plain object, not JSON.stringify(record) — a pre-stringified value
    // with an explicit ::jsonb cast gets serialized a second time by
    // postgres.js, double-encoding the column (see the same comment on
    // addStudent in lib/content/students.js).
    await sql`INSERT INTO newsletter_subscribers (email, data) VALUES (${normalized}, ${record}::jsonb) ON CONFLICT (email) DO NOTHING`
  } catch (err) {
    console.error('addSubscriber failed:', err)
    throw new Error('Could not subscribe. Please try again.')
  }
}

export async function deleteSubscriber(email) {
  const normalized = email.trim().toLowerCase()
  const sql = db()
  await sql`DELETE FROM newsletter_subscribers WHERE email = ${normalized}`
}
