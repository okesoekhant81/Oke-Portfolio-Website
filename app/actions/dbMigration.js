'use server'

import { db, isDbConfigured } from '../../lib/db'
import { readJson } from '../../lib/blobStore'
import { getStudents } from '../../lib/content/students'
import { getInquiries } from '../../lib/content/inquiries'

// Re-migration, this time with the encoding bug fixed (see
// app/actions/dbDiagnostic.js's testJsonbEncodingAction, which confirmed
// it). The first migration used `${JSON.stringify(record)}::jsonb`, which
// double-encodes — every field except id ended up unreadable. This wipes
// whatever's currently in the three PII tables (which is exactly that
// broken data, confirmed via the raw diagnostic dump) and re-copies fresh
// from Blob — still the source of truth, since lib/content/students.js,
// inquiries.js and adminUsers.js are back to reading/writing Blob after
// the rollback — using `${record}::jsonb` (the plain object, not a
// stringified one) this time.
export async function remigratePiiToPostgresAction() {
  if (!isDbConfigured) {
    return { error: 'POSTGRES_URL is not set.' }
  }

  const sql = db()

  await sql`CREATE TABLE IF NOT EXISTS students (id text PRIMARY KEY, data jsonb NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS inquiries (id text PRIMARY KEY, data jsonb NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS admin_users (id text PRIMARY KEY, data jsonb NOT NULL)`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users ((lower(data->>'email')))`

  // Wipe — everything currently in these tables is the double-encoded
  // data from the first (broken) migration attempt, not anything written
  // since (lib/content/*.js has been Blob-backed since the rollback).
  await sql`DELETE FROM students`
  await sql`DELETE FROM inquiries`
  await sql`DELETE FROM admin_users`

  const students = await getStudents({ includeDeleted: true })
  const inquiries = await getInquiries()
  const adminUsers = (await readJson('content/admin-users.json')) || []

  for (const record of students) {
    if (!record?.id) continue
    await sql`INSERT INTO students (id, data) VALUES (${record.id}, ${record}::jsonb)`
  }
  for (const record of inquiries) {
    if (!record?.id) continue
    await sql`INSERT INTO inquiries (id, data) VALUES (${record.id}, ${record}::jsonb)`
  }
  for (const record of adminUsers) {
    if (!record?.id) continue
    await sql`INSERT INTO admin_users (id, data) VALUES (${record.id}, ${record}::jsonb)`
  }

  // Verification, not just counts this time: a sample row from each table,
  // its actual jsonb_typeof (must be 'object'), and whether the specific
  // fields that went missing last time round-trip correctly.
  const [studentSample] = await sql`SELECT id, data, jsonb_typeof(data) AS type FROM students ORDER BY data->>'createdAt' DESC LIMIT 1`
  const [inquirySample] = await sql`SELECT id, data, jsonb_typeof(data) AS type FROM inquiries ORDER BY data->>'submittedAt' DESC LIMIT 1`

  const [[{ count: studentsTotal }], [{ count: inquiriesTotal }], [{ count: adminUsersTotal }]] = await Promise.all([
    sql`SELECT count(*)::int FROM students`,
    sql`SELECT count(*)::int FROM inquiries`,
    sql`SELECT count(*)::int FROM admin_users`,
  ])

  return {
    migratedAt: new Date().toISOString(),
    report: {
      students: { foundInBlob: students.length, totalInPostgres: studentsTotal },
      inquiries: { foundInBlob: inquiries.length, totalInPostgres: inquiriesTotal },
      admin_users: { foundInBlob: adminUsers.length, totalInPostgres: adminUsersTotal },
    },
    verification: {
      studentSample: studentSample
        ? { id: studentSample.id, type: studentSample.type, name: studentSample.data?.name, email: studentSample.data?.email, phone: studentSample.data?.phone }
        : null,
      inquirySample: inquirySample
        ? { id: inquirySample.id, type: inquirySample.type, name: inquirySample.data?.name, email: inquirySample.data?.email, phone: inquirySample.data?.phone }
        : null,
    },
  }
}
