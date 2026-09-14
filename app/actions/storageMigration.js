'use server'

import { readJsonRaw, writeJsonRaw } from '../../lib/blobStore'

// Every fixed content pathname this app stores in Vercel Blob (see the
// PATH/INDEX_PATH constants across lib/content/*.js, lib/activityLog.js and
// lib/content/newsletter.js). Deliberately excludes lib/submissionLimits.js
// and lib/loginAttempts.js — those are short-lived, IP-keyed rate-limit
// counters with no lasting business value, not worth enumerating (they're
// dynamically keyed per-IP, so there's no fixed list) or migrating.
const FIXED_PATHS = [
  'content/homepage.json',
  'content/about.json',
  'content/workshop.json',
  'content/testimonials.json',
  'content/workshop-dates.json',
  'content/students.json',
  'content/inquiries.json',
  'content/newsletter-subscribers.json',
  'content/admin-users.json',
  'content/activity-log.json',
  'content/analytics/post-views.json',
  'content/analytics/daily-views.json',
  'content/analytics/post-likes.json',
  'content/posts-index.json',
]

// Posts live one file per slug (content/posts/{slug}.json) — the set of
// slugs isn't known up front, so it's read from the index first.
async function allContentPaths() {
  const indexText = await readJsonRaw('content/posts-index.json')
  let slugs = []
  try {
    slugs = indexText ? JSON.parse(indexText) : []
  } catch {
    slugs = []
  }
  const postPaths = slugs.map((slug) => `content/posts/${slug}.json`)
  return [...FIXED_PATHS, ...postPaths]
}

// A byte-exact dump of every blob this app manages, read straight from
// storage with no business logic (no soft-delete filtering, no draft/
// publish filtering) applied — meant as a safety net to download and keep
// somewhere safe before running the migration below, not as something this
// app ever reads back in.
export async function getRawStorageSnapshotAction() {
  const paths = await allContentPaths()
  const entries = await Promise.all(paths.map(async (pathname) => [pathname, await readJsonRaw(pathname)]))
  const snapshot = Object.fromEntries(entries.filter(([, text]) => text !== null))
  return { exportedAt: new Date().toISOString(), pathCount: paths.length, snapshot }
}

// Copies every blob this app manages from its current access:'public'
// location to an access:'private' one at the same pathname — additive only,
// never deletes or modifies the public original, and safe to run more than
// once (each run just overwrites the private copy with whatever public
// currently holds). The live site keeps reading/writing the public copies
// throughout — this alone changes nothing about what users or the admin
// panel see. It exists purely so a private copy is in place and verified
// *before* lib/blobStore.js is switched over to read/write it.
export async function migrateStorageToPrivateAction() {
  const paths = await allContentPaths()
  const report = []
  for (const pathname of paths) {
    const text = await readJsonRaw(pathname)
    if (text === null) {
      report.push({ pathname, status: 'skipped-not-found' })
      continue
    }
    try {
      await writeJsonRaw(pathname, text, { access: 'private' })
      const verify = await readJsonRaw(pathname, { access: 'private' })
      report.push({
        pathname,
        status: verify === text ? 'copied' : 'mismatch',
        bytes: text.length,
      })
    } catch (err) {
      report.push({ pathname, status: 'error', error: err.message || String(err) })
    }
  }
  return { migratedAt: new Date().toISOString(), report }
}
