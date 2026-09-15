import postgres from 'postgres'

export const isDbConfigured = Boolean(process.env.POSTGRES_URL)

// Lazily created and reused across calls within the same server instance —
// same reasoning as any other pooled-connection client, and postgres.js
// already pools/queues connections internally, so there's no need to open
// a fresh one per query. `ssl: 'require'` matches Supabase's pooled
// connection string, which doesn't include an sslmode itself the way the
// non-pooling one does.
let sql = null

export function db() {
  if (!isDbConfigured) {
    throw new Error('Storage is not connected yet — connect a Postgres database first.')
  }
  if (!sql) {
    sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' })
  }
  return sql
}
