import postgres from 'postgres'

export const isDbConfigured = Boolean(process.env.POSTGRES_URL)

// Lazily created and reused across calls within the same server instance —
// same reasoning as any other pooled-connection client, and postgres.js
// already pools/queues connections internally, so there's no need to open
// a fresh one per query. `ssl: 'require'` matches Supabase's pooled
// connection string, which doesn't include an sslmode itself the way the
// non-pooling one does.
//
// `prepare: false` is required, not optional: POSTGRES_URL is expected to
// be Supabase's pooled connection string (port 6543, PgBouncer in
// transaction mode), and postgres.js's default of automatically preparing
// statements breaks under transaction-mode PgBouncer — a prepared
// statement from one query can end up replayed against a different
// physical connection on the next one, since PgBouncer hands out whichever
// backend connection is free per transaction rather than keeping one per
// client. See https://github.com/porsager/postgres/issues/93.
let sql = null

export function db() {
  if (!isDbConfigured) {
    throw new Error('Storage is not connected yet — connect a Postgres database first.')
  }
  if (!sql) {
    sql = postgres(process.env.POSTGRES_URL, { ssl: 'require', prepare: false })
  }
  return sql
}
