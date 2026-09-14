import { readJson, writeJson, mutateJson, deleteJson, isBlobConfigured } from '../blobStore'

const INDEX_PATH = 'content/posts-index.json'
const postPath = (slug) => `content/posts/${slug}.json`

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

  const slugs = (await readJson(INDEX_PATH)) || []
  const posts = await Promise.all(slugs.map((slug) => readJson(postPath(slug))))

  // publishedAt is a date picker (no time-of-day), so two posts made the
  // same day tie exactly. Break ties by index in `slugs`, which is
  // append-order, so the post saved most recently still sorts first
  // instead of falling back to a stable sort's insertion order.
  return posts
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => Boolean(post))
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
  const post = await readJson(postPath(slug))
  if (!post) return null
  if (!includeDeleted && post.deletedAt) return null
  if (!includeUnpublished && !isPubliclyVisible(post)) return null
  return post
}

// previousSlug is passed when editing a post whose slug changed, so the old
// blob gets cleaned up instead of leaving an orphaned entry. The per-post
// file (postPath) is a plain overwrite — each post has its own file, so
// there's nothing shared to race on — but the index is one file every
// save and delete touches, so it goes through mutateJson (ETag compare-
// and-swap, see lib/blobStore.js): publishing a post while deleting
// another is a plain read-then-write's classic lost update, silently
// resurrecting the "deleted" slug in the index or losing the new one.
export async function savePost(post, previousSlug) {
  await writeJson(postPath(post.slug), post)

  if (previousSlug && previousSlug !== post.slug) {
    await deleteJson(postPath(previousSlug))
  }

  await mutateJson(INDEX_PATH, (existing) => {
    const slugs = existing || []
    const withoutOld = previousSlug ? slugs.filter((s) => s !== previousSlug) : slugs
    return withoutOld.includes(post.slug) ? withoutOld : [...withoutOld, post.slug]
  })
}

// Soft-delete — the post file and its index entry both stay in place, just
// flagged, so a misclick (or a change of mind) is recoverable through the
// Trash view (see app/admin/trash) instead of being gone the instant
// someone clicks Delete. permanentlyDeletePost is the old hard-delete
// behavior, only reachable from Trash itself.
export async function deletePost(slug) {
  const post = await readJson(postPath(slug))
  if (!post) return
  await writeJson(postPath(slug), { ...post, deletedAt: new Date().toISOString() })
}

export async function restorePost(slug) {
  const post = await readJson(postPath(slug))
  if (!post) return
  const { deletedAt: _deletedAt, ...rest } = post
  await writeJson(postPath(slug), rest)
}

export async function permanentlyDeletePost(slug) {
  await deleteJson(postPath(slug))
  await mutateJson(INDEX_PATH, (existing) => (existing || []).filter((s) => s !== slug))
}
