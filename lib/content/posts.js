import { readJson, writeJson, mutateJson, deleteJson, isBlobConfigured } from '../blobStore'

const INDEX_PATH = 'content/posts-index.json'
const postPath = (slug) => `content/posts/${slug}.json`

export async function getPosts() {
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
    .sort((a, b) => {
      const dateDiff = new Date(b.post.publishedAt) - new Date(a.post.publishedAt)
      return dateDiff !== 0 ? dateDiff : b.index - a.index
    })
    .map(({ post }) => post)
}

export async function getPost(slug) {
  if (!isBlobConfigured) return null
  return readJson(postPath(slug))
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

export async function deletePost(slug) {
  await deleteJson(postPath(slug))
  await mutateJson(INDEX_PATH, (existing) => (existing || []).filter((s) => s !== slug))
}
