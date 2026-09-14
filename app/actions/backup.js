'use server'

import { getHomepageContent } from '../../lib/content/homepage'
import { getAboutContent } from '../../lib/content/about'
import { getWorkshopContent } from '../../lib/content/workshop'
import { getPosts } from '../../lib/content/posts'
import { getTestimonials } from '../../lib/content/testimonials'
import { getClassDates } from '../../lib/content/classDates'
import { getStudents } from '../../lib/content/students'
import { getInquiries } from '../../lib/content/inquiries'
import { getSubscribers } from '../../lib/content/newsletter'
import { getAnalytics, getPostLikes } from '../../lib/content/analytics'
import { readJsonRaw } from '../../lib/blobStore'

// Everything the admin panel manages, gathered into one snapshot — a plain
// data export, not a restore mechanism (there's no matching "import" on
// the other end). Meant to sit somewhere safe in case the Blob store is
// ever lost or corrupted, not to be re-uploaded anywhere.
export async function getFullBackupAction() {
  const [
    homepage,
    about,
    workshop,
    posts,
    testimonials,
    classDates,
    students,
    inquiries,
    newsletterSubscribers,
    analytics,
    postLikes,
  ] = await Promise.all([
    getHomepageContent(),
    getAboutContent(),
    getWorkshopContent(),
    getPosts({ includeUnpublished: true }),
    getTestimonials(),
    getClassDates(),
    getStudents(),
    getInquiries(),
    getSubscribers(),
    getAnalytics(),
    getPostLikes(),
  ])

  return {
    exportedAt: new Date().toISOString(),
    homepage,
    about,
    workshop,
    posts,
    testimonials,
    classDates,
    students,
    inquiries,
    newsletterSubscribers,
    analytics,
    postLikes,
  }
}

// Every fixed content pathname this app stores in Vercel Blob (see the
// PATH/INDEX_PATH constants across lib/content/*.js, lib/activityLog.js and
// lib/content/newsletter.js). Excludes lib/submissionLimits.js and
// lib/loginAttempts.js — those are short-lived, IP-keyed rate-limit
// counters with no lasting business value and no fixed list of pathnames.
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

// A byte-exact dump of every blob this app manages, read straight from
// storage with no business logic (no soft-delete filtering, no draft/
// publish filtering) applied — unlike getFullBackupAction above, which goes
// through the same filtered getters the app itself uses. Meant as a backup
// safety net, not something this app ever reads back in.
export async function getRawStorageSnapshotAction() {
  const indexText = await readJsonRaw('content/posts-index.json')
  let slugs = []
  try {
    slugs = indexText ? JSON.parse(indexText) : []
  } catch {
    slugs = []
  }
  const paths = [...FIXED_PATHS, ...slugs.map((slug) => `content/posts/${slug}.json`)]

  const entries = await Promise.all(paths.map(async (pathname) => [pathname, await readJsonRaw(pathname)]))
  const snapshot = Object.fromEntries(entries.filter(([, text]) => text !== null))
  return { exportedAt: new Date().toISOString(), pathCount: paths.length, snapshot }
}
