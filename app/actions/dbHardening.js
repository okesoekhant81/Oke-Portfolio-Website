'use server'

import { db, isDbConfigured } from '../../lib/db'

// Supabase auto-exposes every table in the public schema through its own
// REST API (PostgREST, at https://{project}.supabase.co/rest/v1/{table})
// unless Row Level Security is enabled on it. The app never uses that API
// — it talks to Postgres directly over the wire protocol — but the table
// still exists in the same public schema Supabase's API serves from, so
// without this, anyone holding the project's anon/publishable key (which
// is meant to be public-facing; it's the one meant for NEXT_PUBLIC_ use)
// could read or write students/inquiries/admin_users over plain HTTP,
// bypassing this app's authentication entirely.
//
// Enabling RLS with no policies denies every role except the table owner
// by default — and the app's own connection (POSTGRES_URL, the `postgres`
// role that created these tables) *is* the owner, so this doesn't touch
// how the app itself reads or writes. It only blocks the separate
// PostgREST path, which authenticates as `anon` or `authenticated`,
// neither of which owns these tables. Idempotent — re-running this when
// RLS is already enabled is a no-op, not an error.
export async function hardenPiiTablesAction() {
  if (!isDbConfigured) {
    return { error: 'POSTGRES_URL is not set.' }
  }
  const sql = db()

  await sql`ALTER TABLE students ENABLE ROW LEVEL SECURITY`
  await sql`ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY`
  await sql`ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY`

  const rows = await sql`
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname IN ('students', 'inquiries', 'admin_users') AND relkind = 'r'
  `
  const report = Object.fromEntries(rows.map((r) => [r.relname, r.relrowsecurity]))
  return { report }
}
