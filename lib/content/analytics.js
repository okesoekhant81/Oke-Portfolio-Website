import { readJson, writeJson, isBlobConfigured } from '../blobStore'

const POST_VIEWS_PATH = 'content/analytics/post-views.json' // { [slug]: count }
const DAILY_VIEWS_PATH = 'content/analytics/daily-views.json' // { [YYYY-MM-DD]: count }

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// Best-effort counters, not exact analytics: reads then writes the whole
// JSON object, so two views landing in the same instant can race and one
// increment can be lost. Fine for a personal blog's traffic; a real counter
// would need an atomic store, which is more infrastructure than this
// project takes on for a "how many people read this" number.
export async function recordView(slug) {
  if (!isBlobConfigured || !slug) return
  try {
    const [postViews, daily] = await Promise.all([readJson(POST_VIEWS_PATH), readJson(DAILY_VIEWS_PATH)])
    const nextPostViews = { ...(postViews || {}) }
    nextPostViews[slug] = (nextPostViews[slug] || 0) + 1
    const key = todayKey()
    const nextDaily = { ...(daily || {}) }
    nextDaily[key] = (nextDaily[key] || 0) + 1
    await Promise.all([writeJson(POST_VIEWS_PATH, nextPostViews), writeJson(DAILY_VIEWS_PATH, nextDaily)])
  } catch {
    // View counts are a nice-to-have — never break the page over one.
  }
}

export async function getAnalytics() {
  if (!isBlobConfigured) return { postViews: {}, daily: {} }
  const [postViews, daily] = await Promise.all([readJson(POST_VIEWS_PATH), readJson(DAILY_VIEWS_PATH)])
  return { postViews: postViews || {}, daily: daily || {} }
}
