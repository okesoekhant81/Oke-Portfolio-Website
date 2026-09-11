import { readJson, writeJson, deleteJson, isBlobConfigured } from '../blobStore'

const INDEX_PATH = 'content/posts-index.json'
const postPath = (slug) => `content/posts/${slug}.json`

export async function getPosts() {
  if (!isBlobConfigured) return []

  const slugs = (await readJson(INDEX_PATH)) || []
  const posts = await Promise.all(slugs.map((slug) => readJson(postPath(slug))))
  return posts
    .filter(Boolean)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
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
