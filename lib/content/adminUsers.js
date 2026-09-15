import { db, isDbConfigured } from '../db'
import { hashPassword, verifyPassword } from '../passwordHash'

// Admin users live in Postgres, not Blob — same reasoning as students.js
// and inquiries.js: this holds password hashes, the most sensitive record
// this app has. One row per admin, id as the primary key, the record
// itself as jsonb. admin_users_email_idx (a unique index on lower(email),
// created by the migration in app/actions/dbMigration.js) enforces the
// "one admin per email" rule at the database level.

// Returned to the Team page — never includes passwordHash.
function toPublic(user) {
  const { passwordHash: _passwordHash, ...rest } = user
  return rest
}

export async function getAdminUsers() {
  if (!isDbConfigured) return []
  const sql = db()
  const rows = await sql`SELECT data FROM admin_users ORDER BY data->>'createdAt' ASC`
  return rows.map((r) => toPublic(r.data))
}

export async function addAdminUser({ name, email, password }) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  const sql = db()
  try {
    await sql`INSERT INTO admin_users (id, data) VALUES (${record.id}, ${JSON.stringify(record)}::jsonb)`
  } catch (err) {
    // 23505 = unique_violation — the admin_users_email_idx constraint.
    if (err.code === '23505') {
      throw new Error('An admin with that email already exists.')
    }
    throw err
  }
  return toPublic(record)
}

export async function deleteAdminUser(id) {
  const sql = db()
  await sql`DELETE FROM admin_users WHERE id = ${id}`
}

// Returns the matching user (without passwordHash) on success, or null —
// ADMIN_PASSWORD is checked separately by the login action itself, this is
// only ever the named-team-member path.
export async function verifyAdminCredentials(email, password) {
  if (!isDbConfigured || !email || !password) return null
  const sql = db()
  const rows = await sql`SELECT data FROM admin_users WHERE lower(data->>'email') = ${email.toLowerCase()}`
  const user = rows[0]?.data
  if (!user || !verifyPassword(password, user.passwordHash)) return null
  return toPublic(user)
}
