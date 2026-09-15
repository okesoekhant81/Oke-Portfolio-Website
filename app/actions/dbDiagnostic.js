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

// Isolated, throwaway test — writes the same small object several
// different ways into a scratch table (never touching
// students/inquiries/admin_users) and reports jsonb_typeof for each:
// 'object' is correct, 'string' means that write pattern double-encodes.
// 'stringify-cast' is how every real write in lib/content/students.js/
// inquiries.js/adminUsers.js was doing it before the rollback:
// `${JSON.stringify(x)}::jsonb`, passing an already-stringified value with
// an explicit cast. The suspected fix is 'object-cast': pass the plain
// object instead and let postgres.js serialize it once, using the type
// Postgres reports back for that parameter from the `::jsonb` cast
// context. Each variant is isolated in its own try/catch so one failing
// (e.g. postgres.js refusing to serialize a bare object at all) doesn't
// hide the result of the others.
export async function testJsonbEncodingAction() {
  if (!isDbConfigured) {
    return { error: 'POSTGRES_URL is not set.' }
  }
  const sql = db()
  const probe = { hello: 'world', n: 1 }

  await sql`CREATE TABLE IF NOT EXISTS _encoding_test (id text PRIMARY KEY, data jsonb NOT NULL)`
  await sql`DELETE FROM _encoding_test WHERE id IN ('stringify-cast', 'object-cast', 'typed-jsonb')`

  const attempts = [
    ['stringify-cast', () => sql`INSERT INTO _encoding_test (id, data) VALUES ('stringify-cast', ${JSON.stringify(probe)}::jsonb)`],
    ['object-cast', () => sql`INSERT INTO _encoding_test (id, data) VALUES ('object-cast', ${probe}::jsonb)`],
    ['typed-jsonb', () => sql`INSERT INTO _encoding_test (id, data) VALUES ('typed-jsonb', ${sql.typed(JSON.stringify(probe), 3802)})`],
  ]
  const writeErrors = {}
  for (const [label, run] of attempts) {
    try {
      await run()
    } catch (err) {
      writeErrors[label] = err.message || String(err)
    }
  }

  const rows = await sql`SELECT id, data::text AS raw, jsonb_typeof(data) AS type FROM _encoding_test WHERE id IN ('stringify-cast', 'object-cast', 'typed-jsonb')`
  await sql`DROP TABLE _encoding_test`

  return { testedAt: new Date().toISOString(), rows, writeErrors }
}
