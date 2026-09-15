'use server'

import { db, isDbConfigured } from '../../lib/db'
import { readJson } from '../../lib/blobStore'
import { getStudents } from '../../lib/content/students'
import { getInquiries } from '../../lib/content/inquiries'

// One-time: creates the three PII tables (if they don't already exist) and
// copies every record currently in Blob into them. Purely additive — never
// touches or modifies the Blob originals, and safe to re-run (ON CONFLICT
// DO NOTHING skips records already copied, so a second run just confirms
// nothing changed).
//
// lib/content/students.js and lib/content/inquiries.js are still
// Blob-backed at the point this runs (the cutover to reading/writing
// Postgres happens in a later, separate change), so this reads through
// their normal getters. admin-users has no equivalent getter that includes
// the password hash (getAdminUsers strips it, since it also backs the
// public Team page), so this reads the raw Blob JSON directly instead —
// the one place in the app allowed to see the raw admin-users record.
export async function migratePiiToPostgresAction() {
  if (!isDbConfigured) {
    return { error: 'POSTGRES_URL is not set. Add it in the Vercel project settings and redeploy first.' }
  }

  const sql = db()

  await sql`CREATE TABLE IF NOT EXISTS students (id text PRIMARY KEY, data jsonb NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS inquiries (id text PRIMARY KEY, data jsonb NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS admin_users (id text PRIMARY KEY, data jsonb NOT NULL)`
  // Enforces the same "one admin per email" rule addAdminUser already
  // checks in JS today — a real constraint here means that check keeps
  // holding even under two simultaneous "add admin" submissions, which a
  // JS-only check (read list, see if email's there, insert) can't
  // guarantee.
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users ((lower(data->>'email')))`

  const students = await getStudents({ includeDeleted: true })
  const inquiries = await getInquiries()
  const adminUsers = (await readJson('content/admin-users.json')) || []

  let studentsInserted = 0
  for (const record of students) {
    if (!record?.id) continue
    const result = await sql`
      INSERT INTO students (id, data) VALUES (${record.id}, ${JSON.stringify(record)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `
    studentsInserted += result.count
  }

  let inquiriesInserted = 0
  for (const record of inquiries) {
    if (!record?.id) continue
    const result = await sql`
      INSERT INTO inquiries (id, data) VALUES (${record.id}, ${JSON.stringify(record)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `
    inquiriesInserted += result.count
  }

  let adminUsersInserted = 0
  for (const record of adminUsers) {
    if (!record?.id) continue
    const result = await sql`
      INSERT INTO admin_users (id, data) VALUES (${record.id}, ${JSON.stringify(record)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `
    adminUsersInserted += result.count
  }

  const [[{ count: studentsTotal }], [{ count: inquiriesTotal }], [{ count: adminUsersTotal }]] = await Promise.all([
    sql`SELECT count(*)::int FROM students`,
    sql`SELECT count(*)::int FROM inquiries`,
    sql`SELECT count(*)::int FROM admin_users`,
  ])

  return {
    migratedAt: new Date().toISOString(),
    report: {
      students: { foundInBlob: students.length, insertedThisRun: studentsInserted, totalInPostgres: studentsTotal },
      inquiries: { foundInBlob: inquiries.length, insertedThisRun: inquiriesInserted, totalInPostgres: inquiriesTotal },
      admin_users: { foundInBlob: adminUsers.length, insertedThisRun: adminUsersInserted, totalInPostgres: adminUsersTotal },
    },
  }
}
