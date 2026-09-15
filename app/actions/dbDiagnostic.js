'use server'

import { db, isDbConfigured } from '../../lib/db'

// Read-only — dumps the raw, unprocessed jsonb text for a few rows from
// each PII table, straight from Postgres, with no JS-side merging or
// transformation in the way. Exists purely to see exactly what's actually
// stored after the migration lost fields somewhere, instead of guessing
// from app-level symptoms.
export async function inspectPiiTablesAction() {
  if (!isDbConfigured) {
    return { error: 'POSTGRES_URL is not set.' }
  }
  const sql = db()
  const students = await sql`SELECT id, data::text AS raw, pg_column_size(data) AS bytes FROM students ORDER BY data->>'createdAt' DESC LIMIT 5`
  const inquiries = await sql`SELECT id, data::text AS raw, pg_column_size(data) AS bytes FROM inquiries ORDER BY data->>'submittedAt' DESC LIMIT 5`
  const counts = await sql`SELECT (SELECT count(*)::int FROM students) AS students, (SELECT count(*)::int FROM inquiries) AS inquiries`
  return { inspectedAt: new Date().toISOString(), counts: counts[0], students, inquiries }
}
