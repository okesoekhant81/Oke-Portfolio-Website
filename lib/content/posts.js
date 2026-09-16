import { readJson, writeJson, mutateJson, deleteJson, isBlobConfigured } from '../blobStore'

// Split storage: a lightweight list file (everything a list view needs —
// title, excerpt, image, date — never the body) plus one full-content file
// per post (read one at a time by getPost()). Replaced an earlier
// single-file-for-everything design that made getPosts() a single read but
// meant saving *any* post made Vercel Blob's CDN cache treat *every* post
// as stale for up to a minute — the whole site's worth of articles shared
// that one file. This keeps the single-read win for list views while
// narrowing that staleness blast radius back down to just the post
// actually being saved, matching the original one-file-per-post design's
// behavior for article detail pages.
const LIST_PATH = 'content/posts-list.json'
const postPath = (slug) => `content/posts/${slug}.json`

// The fields a list view actually needs. Keep in sync with the identical
// list in app/actions/postsSplitMigration.js (the one-time migration that
// built this shape from the old single-file storage).
const SUMMARY_FIELDS = ['slug', 'title', 'titleMy', 'excerpt', 'excerptMy', 'coverImageUrl', 'tags', 'publishedAt', 'status', 'deletedAt']

function toSummary(post) {
  const summary = {}
  for (const field of SUMMARY_FIELDS) summary[field] = post[field]
  return summary
}

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

  const posts = (await readJson(LIST_PATH)) || []

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
  const post = await readJson(postPath(slug))
  if (!post) return null
  if (!includeDeleted && post.deletedAt) return null
  if (!includeUnpublished && !isPubliclyVisible(post)) return null
  return post
}

// previousSlug is passed when editing a post whose slug changed, so the old
// per-post blob gets cleaned up instead of leaving an orphaned entry. The
// per-post file is a plain overwrite — each post has its own file, so
// there's nothing shared to race on — but the list file is one file every
// save and delete touches, so it goes through mutateJson (ETag compare-
// and-swap, see lib/blobStore.js): publishing a post while deleting another
// is a plain read-then-write's classic lost update, silently resurrecting
// the "deleted" slug in the list or losing the new one.
export async function savePost(post, previousSlug) {
  await writeJson(postPath(post.slug), post)

  if (previousSlug && previousSlug !== post.slug) {
    await deleteJson(postPath(previousSlug))
  }

  await mutateJson(LIST_PATH, (existing) => {
    const summaries = existing || []
    const withoutOld = previousSlug && previousSlug !== post.slug ? summaries.filter((s) => s.slug !== previousSlug) : summaries
    const summary = toSummary(post)
    const index = withoutOld.findIndex((s) => s.slug === post.slug)
    if (index === -1) return [...withoutOld, summary]
    const next = [...withoutOld]
    next[index] = summary
    return next
  })
}

// Soft-delete — the post file and its list entry both stay in place, just
// flagged, so a misclick (or a change of mind) is recoverable through the
// Trash view (see app/admin/trash) instead of being gone the instant
// someone clicks Delete. permanentlyDeletePost is the old hard-delete
// behavior, only reachable from Trash itself.
export async function deletePost(slug) {
  const post = await readJson(postPath(slug))
  if (!post) return
  const updated = { ...post, deletedAt: new Date().toISOString() }
  await writeJson(postPath(slug), updated)
  await mutateJson(LIST_PATH, (existing) => {
    const summaries = existing || []
    const index = summaries.findIndex((s) => s.slug === slug)
    if (index === -1) return summaries
    const next = [...summaries]
    next[index] = toSummary(updated)
    return next
  })
}

export async function restorePost(slug) {
  const post = await readJson(postPath(slug))
  if (!post) return
  const { deletedAt: _deletedAt, ...rest } = post
  await writeJson(postPath(slug), rest)
  await mutateJson(LIST_PATH, (existing) => {
    const summaries = existing || []
    const index = summaries.findIndex((s) => s.slug === slug)
    if (index === -1) return summaries
    const next = [...summaries]
    next[index] = toSummary(rest)
    return next
  })
}

export async function permanentlyDeletePost(slug) {
  await deleteJson(postPath(slug))
  await mutateJson(LIST_PATH, (existing) => (existing || []).filter((s) => s.slug !== slug))
}

// Full content (body included) for every post, not just the list summary —
// only for the admin data export (see getFullBackupAction in
// app/actions/backup.js), which genuinely needs every article's actual text
// to be a real backup. Deliberately not used anywhere else: this is back to
// the N+1 read pattern getPosts() exists to avoid, acceptable here since a
// backup is an occasional, admin-triggered action rather than something
// every public page load pays for.
export async function getPostsFull({ includeUnpublished = false, includeDeleted = false } = {}) {
  const summaries = await getPosts({ includeUnpublished, includeDeleted })
  const posts = await Promise.all(summaries.map((s) => readJson(postPath(s.slug))))
  return posts.filter(Boolean)
}
