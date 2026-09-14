import { readJson, mutateJson, isBlobConfigured } from './blobStore'

const PATH = 'content/activity-log.json'
const MAX_ENTRIES = 500

// No per-admin identity — there's one shared ADMIN_PASSWORD, not separate
// logins, so this is an audit trail of *what* changed and *when*, not
// *who*. Genuine multi-admin (separate accounts) would mean changing the
// auth model itself, a bigger call than this log.
export async function logActivity(action, detail) {
  if (!isBlobConfigured) return
  try {
    await mutateJson(PATH, (existing) => {
      const next = [{ action, detail, at: new Date().toISOString() }, ...(existing || [])]
      return next.slice(0, MAX_ENTRIES)
    })
  } catch {
    // Best-effort only — a logging failure must never surface as if the
    // actual save/delete/etc. it's recording had failed.
  }
}

export async function getActivityLog() {
  if (!isBlobConfigured) return []
  const log = await readJson(PATH)
  return log || []
}
