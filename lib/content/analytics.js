import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

const POST_VIEWS_PATH = 'content/analytics/post-views.json' // { [slug]: count }
const DAILY_VIEWS_PATH = 'content/analytics/daily-views.json' // { [YYYY-MM-DD]: count }
const POST_LIKES_PATH = 'content/analytics/post-likes.json' // { [slug]: count }

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// Every view of every post touches these same two files, so this is the
// highest-traffic write path in the app — mutateJson (ETag compare-and-
// swap with retries, see lib/blobStore.js) rather than a plain read-then-
// write, which loses an increment whenever two views land close together.
// Still not perfectly exact under very heavy simultaneous traffic (mutateJson
// itself gives up after its retries), but meaningfully closer than before,
// for the cost of nothing extra to maintain.
export async function recordView(slug) {
  if (!isBlobConfigured || !slug) return
  try {
    const key = todayKey()
    await Promise.all([
      mutateJson(POST_VIEWS_PATH, (existing) => ({ ...(existing || {}), [slug]: ((existing || {})[slug] || 0) + 1 })),
      mutateJson(DAILY_VIEWS_PATH, (existing) => ({ ...(existing || {}), [key]: ((existing || {})[key] || 0) + 1 })),
    ])
  } catch {
    // View counts are a nice-to-have — never break the page over one.
  }
}

export async function getAnalytics() {
  if (!isBlobConfigured) return { postViews: {}, daily: {} }
  const [postViews, daily] = await Promise.all([readJson(POST_VIEWS_PATH), readJson(DAILY_VIEWS_PATH)])
  return { postViews: postViews || {}, daily: daily || {} }
}

// No accounts on this site, so a "like" is anonymous and per-browser — the
// client remembers whether it already liked a post (localStorage) and
// tells us which direction to move the count. Returns the new total so
// the client can reconcile without a full page refresh.
export async function setPostLiked(slug, liked) {
  if (!isBlobConfigured || !slug) return null
  try {
    let total = 0
    await mutateJson(POST_LIKES_PATH, (existing) => {
      const next = { ...(existing || {}) }
      next[slug] = Math.max(0, (next[slug] || 0) + (liked ? 1 : -1))
      total = next[slug]
      return next
    })
    return total
  } catch {
    return null
  }
}

export async function getPostLikes() {
  if (!isBlobConfigured) return {}
  const likes = await readJson(POST_LIKES_PATH)
  return likes || {}
}
