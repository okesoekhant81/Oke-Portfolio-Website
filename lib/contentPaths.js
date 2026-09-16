import { readJsonRaw } from './blobStore'

// Every fixed content pathname this app stores in Vercel Blob (see the
// PATH/INDEX_PATH constants across lib/content/*.js, lib/activityLog.js and
// lib/content/newsletter.js). Excludes lib/submissionLimits.js and
// lib/loginAttempts.js — those are short-lived, IP-keyed rate-limit
// counters with no lasting business value and no fixed list of pathnames.
// Also excludes students.json/inquiries.json/admin-users.json: that PII
// moved to Postgres (see lib/db.js and lib/content/students.js,
// inquiries.js, adminUsers.js) — those three Blob files are frozen
// leftovers pending cleanup, not live content, so a raw snapshot of "what
// Blob currently holds" listing them would be misleading rather than
// useful (getFullBackupAction in app/actions/backup.js already covers
// students/inquiries with their current, Postgres-backed data).
//
// content/posts-all.json is the same kind of frozen leftover as of the
// posts split-storage migration (see lib/content/posts.js) — live posts now
// read/write content/posts-list.json plus one content/posts/{slug}.json per
// post, pending cleanup of the single-file version.
export const FIXED_CONTENT_PATHS = [
  'content/homepage.json',
  'content/about.json',
  'content/workshop.json',
  'content/testimonials.json',
  'content/workshop-dates.json',
  'content/newsletter-subscribers.json',
  'content/activity-log.json',
  'content/analytics/post-views.json',
  'content/analytics/daily-views.json',
  'content/analytics/post-likes.json',
  'content/posts-list.json',
]

// Posts live one file per slug (content/posts/{slug}.json) again — the set
// of slugs isn't known up front, so it's read from the list file first.
export async function allContentPaths() {
  const listText = await readJsonRaw('content/posts-list.json')
  let slugs = []
  try {
    slugs = listText ? JSON.parse(listText).map((p) => p.slug) : []
  } catch {
    slugs = []
  }
  return [...FIXED_CONTENT_PATHS, ...slugs.map((slug) => `content/posts/${slug}.json`)]
}
