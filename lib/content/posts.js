import { readJson, writeJson, deleteJson, isBlobConfigured } from '../blobStore'

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
// blob gets cleaned up instead of leaving an orphaned entry.
export async function savePost(post, previousSlug) {
  await writeJson(postPath(post.slug), post)

  const slugs = (await readJson(INDEX_PATH)) || []
  const withoutOld = previousSlug ? slugs.filter((s) => s !== previousSlug) : slugs

  if (previousSlug && previousSlug !== post.slug) {
    await deleteJson(postPath(previousSlug))
  }
  if (!withoutOld.includes(post.slug)) {
    await writeJson(INDEX_PATH, [...withoutOld, post.slug])
  } else if (previousSlug) {
    await writeJson(INDEX_PATH, withoutOld)
  }
}

export async function deletePost(slug) {
  await deleteJson(postPath(slug))
  const slugs = (await readJson(INDEX_PATH)) || []
  await writeJson(
    INDEX_PATH,
    slugs.filter((s) => s !== slug)
  )
}
