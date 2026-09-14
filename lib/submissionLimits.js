import { readJson, mutateJson, isBlobConfigured } from './blobStore'

const WINDOW_MS = 30 * 60 * 1000
const MAX_SUBMISSIONS = 5

// bucket keeps each public form's rate limit independent — an IP hammering
// the newsletter form shouldn't burn through the workshop registration
// form's own allowance, or vice versa.
function pathFor(bucket, ip) {
  const safe = ip.replace(/[^a-zA-Z0-9.:-]/g, '_')
  return `content/security/${bucket}/${safe}.json`
}

function recentSubmissions(state) {
  const now = Date.now()
  return (state?.submissions || []).filter((t) => now - t < WINDOW_MS)
}

// Same per-IP sliding-window shape as lib/loginAttempts.js — a genuine
// registrant only ever submits this form once or twice, so five in half
// an hour is already generous headroom before a real person could hit it,
// while a script hammering the endpoint gets cut off fast.
export async function checkSubmissionLimit(bucket, ip) {
  if (!isBlobConfigured) return { limited: false }
  const state = await readJson(pathFor(bucket, ip))
  const recent = recentSubmissions(state)
  if (recent.length >= MAX_SUBMISSIONS) {
    const retryAfterSeconds = Math.ceil((Math.min(...recent) + WINDOW_MS - Date.now()) / 1000)
    return { limited: true, retryAfterSeconds: Math.max(retryAfterSeconds, 1) }
  }
  return { limited: false }
}

// mutateJson, not a plain read-then-write — same reasoning as
// lib/loginAttempts.js: whatever's hitting this fast enough to matter is
// hitting it from the same IP close together, exactly the burst a plain
// read-then-write loses updates under.
export async function recordSubmission(bucket, ip) {
  if (!isBlobConfigured) return
  await mutateJson(pathFor(bucket, ip), (state) => ({ submissions: [...recentSubmissions(state), Date.now()] }))
}
