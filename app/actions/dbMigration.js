'use server'

import { db, isDbConfigured } from '../../lib/db'
import { readJson } from '../../lib/blobStore'

// One-time: creates newsletter_subscribers (if it doesn't exist), enables
// Row Level Security on it (same reasoning as students/inquiries/
// admin_users — see lib/db.js and the RLS work on those tables), and
// copies every subscriber currently in Blob into it. Uses `${record}::jsonb`
// (the plain object) rather than `${JSON.stringify(record)}::jsonb`,
// learned the hard way on the PII migration — the stringified form
// double-encodes. Purely additive — never touches the Blob original, and
// safe to re-run (ON CONFLICT DO NOTHING). lib/content/newsletter.js is
// already Postgres-backed at the point this runs, so it reads the Blob
// copy directly by pathname instead of through getSubscribers().
export async function migrateNewsletterToPostgresAction() {
  if (!isDbConfigured) {
    return { error: 'POSTGRES_URL is not set.' }
  }

  const sql = db()

  await sql`CREATE TABLE IF NOT EXISTS newsletter_subscribers (email text PRIMARY KEY, data jsonb NOT NULL)`
  await sql`ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY`

  const subscribers = (await readJson('content/newsletter-subscribers.json')) || []

  for (const record of subscribers) {
    if (!record?.email) continue
    await sql`INSERT INTO newsletter_subscribers (email, data) VALUES (${record.email}, ${record}::jsonb) ON CONFLICT (email) DO NOTHING`
  }

  const [sample] = await sql`SELECT email, data, jsonb_typeof(data) AS type FROM newsletter_subscribers LIMIT 1`
  const [{ count: total }] = await sql`SELECT count(*)::int FROM newsletter_subscribers`

  return {
    migratedAt: new Date().toISOString(),
    foundInBlob: subscribers.length,
    totalInPostgres: total,
    sample: sample ? { email: sample.email, type: sample.type, subscribedAt: sample.data?.subscribedAt } : null,
  }
}
