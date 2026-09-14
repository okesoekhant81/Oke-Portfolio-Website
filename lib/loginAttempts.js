import { readJson, mutateJson, isBlobConfigured } from './blobStore'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function pathFor(ip) {
  const safe = ip.replace(/[^a-zA-Z0-9.:-]/g, '_')
  return `content/security/login-attempts/${safe}.json`
}

function recentFailures(state) {
  const now = Date.now()
  return (state?.failures || []).filter((t) => now - t < WINDOW_MS)
}

// Best-effort, per-IP: a determined attacker who can hit us from many IPs
// isn't stopped, but this makes guessing the one shared admin password
// far too slow to be worth trying online. A global (not per-IP) lockout
// would itself be a denial-of-service lever against the real owner, so
// each IP gets its own bucket instead.
export async function checkLockout(ip) {
  if (!isBlobConfigured) return { locked: false }
  const state = await readJson(pathFor(ip))
  const recent = recentFailures(state)
  if (recent.length >= MAX_ATTEMPTS) {
    const unlocksAt = Math.min(...recent) + LOCKOUT_MS
    if (Date.now() < unlocksAt) {
      return { locked: true, retryAfterSeconds: Math.ceil((unlocksAt - Date.now()) / 1000) }
    }
  }
  return { locked: false }
}

// mutateJson (not a plain read-then-write) since a brute-force attempt is
// specifically a burst of requests from the same IP close together — the
// exact shape a plain read-then-write loses updates under, which here
// would mean lost failed-attempt records and a weaker lockout than
// intended, right when it matters most.
export async function recordFailedAttempt(ip) {
  if (!isBlobConfigured) return
  await mutateJson(pathFor(ip), (state) => ({ failures: [...recentFailures(state), Date.now()] }))
}

export async function clearFailedAttempts(ip) {
  if (!isBlobConfigured) return
  await mutateJson(pathFor(ip), () => ({ failures: [] }))
}
