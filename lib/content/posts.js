import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

// A single array of every post (published, draft, and soft-deleted), in
// append order — replaced the old one-file-per-post shape (an index file
// plus content/posts/{slug}.json per post), which meant every getPosts()
// call did 1 index read + N per-post reads. That N+1 pattern hit on nearly
// every public page (homepage, blog list, sitemap, RSS, related articles)
// and was the main driver of Blob operation volume on this site. One file
// means one read, no matter how many posts there are.
const ALL_POSTS_PATH = 'content/posts-all.json'

// A post is publicly visible once it's not a draft AND its publishedAt has
// actually arrived — a future publishedAt on a 'published' post is a
// schedule, not a typo, so it stays hidden from every public listing until
// that date. Exported so the admin list can show the same "Draft" /
// "Scheduled" badge without duplicating the rule.
export function isPubliclyVisible(post, now = Date.now()) {
  if (post.status === 'draft') return false
  return new Date(post.publishedAt).getTime() <= now
}

export async function getPosts({ includeUnpublished = false, includeDeleted = false } = {}) {
  if (!isBlobConfigured) return []

  const posts = (await readJson(ALL_POSTS_PATH)) || []

  // publishedAt is a date picker (no time-of-day), so two posts made the
  // same day tie exactly. Break ties by index in the stored array, which is
  // append-order, so the post saved most recently still sorts first
  // instead of falling back to a stable sort's insertion order.
  return posts
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => includeDeleted || !post.deletedAt)
    .filter(({ post }) => includeUnpublished || isPubliclyVisible(post))
    .sort((a, b) => {
      const dateDiff = new Date(b.post.publishedAt) - new Date(a.post.publishedAt)
      return dateDiff !== 0 ? dateDiff : b.index - a.index
    })
    .map(({ post }) => post)
}

export async function getPost(slug, { includeUnpublished = false, includeDeleted = false } = {}) {
  if (!isBlobConfigured) return null
  const posts = (await readJson(ALL_POSTS_PATH)) || []
  const post = posts.find((p) => p.slug === slug)
  if (!post) return null
  if (!includeDeleted && post.deletedAt) return null
  if (!includeUnpublished && !isPubliclyVisible(post)) return null
  return post
}

// previousSlug is passed when editing a post whose slug changed. Every save
// now touches the same shared file every other post's save/delete does, so
// this goes through mutateJson (ETag compare-and-swap, see
// lib/blobStore.js) rather than a plain read-then-write: two admins editing
// different posts at the same moment would otherwise be a classic lost
// update, with whichever write lands second silently discarding the first.
//
// An existing slug keeps its array position (so publishing an edit doesn't
// reshuffle tie-break order among same-day posts); a new or renamed slug is
// appended at the end, matching the old index's append-order semantics.
export async function savePost(post, previousSlug) {
  await mutateJson(ALL_POSTS_PATH, (existing) => {
    const posts = existing || []
    const withoutOld = previousSlug && previousSlug !== post.slug ? posts.filter((p) => p.slug !== previousSlug) : posts
    const index = withoutOld.findIndex((p) => p.slug === post.slug)
    if (index === -1) return [...withoutOld, post]
    const next = [...withoutOld]
    next[index] = post
    return next
  })
}

// Soft-delete — the post stays in the array, just flagged, so a misclick
// (or a change of mind) is recoverable through the Trash view (see
// app/admin/trash) instead of being gone the instant someone clicks Delete.
// permanentlyDeletePost is the old hard-delete behavior, only reachable
// from Trash itself.
export async function deletePost(slug) {
  await mutateJson(ALL_POSTS_PATH, (existing) => {
    const posts = existing || []
    const index = posts.findIndex((p) => p.slug === slug)
    if (index === -1) return posts
    const next = [...posts]
    next[index] = { ...next[index], deletedAt: new Date().toISOString() }
    return next
  })
}

export async function restorePost(slug) {
  await mutateJson(ALL_POSTS_PATH, (existing) => {
    const posts = existing || []
    const index = posts.findIndex((p) => p.slug === slug)
    if (index === -1) return posts
    const { deletedAt: _deletedAt, ...rest } = posts[index]
    const next = [...posts]
    next[index] = rest
    return next
  })
}

export async function permanentlyDeletePost(slug) {
  await mutateJson(ALL_POSTS_PATH, (existing) => (existing || []).filter((p) => p.slug !== slug))
}
