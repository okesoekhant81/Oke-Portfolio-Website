import { readJson, writeJson, isBlobConfigured } from './blobStore'

const WINDOW_MS = 30 * 60 * 1000
const MAX_SUBMISSIONS = 5

function pathFor(ip) {
  const safe = ip.replace(/[^a-zA-Z0-9.:-]/g, '_')
  return `content/security/inquiry-submissions/${safe}.json`
}

function recentSubmissions(state) {
  const now = Date.now()
  return (state?.submissions || []).filter((t) => now - t < WINDOW_MS)
}

// Same per-IP sliding-window shape as lib/loginAttempts.js — a genuine
// registrant only ever submits this form once or twice, so five in half
// an hour is already generous headroom before a real person could hit it,
// while a script hammering the endpoint gets cut off fast.
export async function checkSubmissionLimit(ip) {
  if (!isBlobConfigured) return { limited: false }
  const state = await readJson(pathFor(ip))
  const recent = recentSubmissions(state)
  if (recent.length >= MAX_SUBMISSIONS) {
    const retryAfterSeconds = Math.ceil((Math.min(...recent) + WINDOW_MS - Date.now()) / 1000)
    return { limited: true, retryAfterSeconds: Math.max(retryAfterSeconds, 1) }
  }
  return { limited: false }
}

export async function recordSubmission(ip) {
  if (!isBlobConfigured) return
  const state = await readJson(pathFor(ip))
  const recent = recentSubmissions(state)
  recent.push(Date.now())
  await writeJson(pathFor(ip), { submissions: recent })
}
