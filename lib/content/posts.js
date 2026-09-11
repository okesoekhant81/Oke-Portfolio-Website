import { kv, isKvConfigured } from '../kv'

const INDEX_KEY = 'posts:index'
const postKey = (slug) => `post:${slug}`

export async function getPosts() {
  if (!isKvConfigured) return []
  try {
    const slugs = (await kv.get(INDEX_KEY)) || []
    const posts = await Promise.all(slugs.map((slug) => kv.get(postKey(slug))))
    return posts
      .filter(Boolean)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  } catch {
    return []
  }
}

export async function getPost(slug) {
  if (!isKvConfigured) return null
  try {
    return await kv.get(postKey(slug))
  } catch {
    return null
  }
}

// previousSlug is passed when editing a post whose slug changed, so the old
// key gets cleaned up instead of leaving an orphaned entry.
export async function savePost(post, previousSlug) {
  if (!isKvConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel KV store first.')
  }
  await kv.set(postKey(post.slug), post)

  const slugs = (await kv.get(INDEX_KEY)) || []
  const withoutOld = previousSlug ? slugs.filter((s) => s !== previousSlug) : slugs
  if (previousSlug && previousSlug !== post.slug) {
    await kv.del(postKey(previousSlug))
  }
  if (!withoutOld.includes(post.slug)) {
    await kv.set(INDEX_KEY, [...withoutOld, post.slug])
  } else if (previousSlug) {
    await kv.set(INDEX_KEY, withoutOld)
  }
}

export async function deletePost(slug) {
  if (!isKvConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel KV store first.')
  }
  await kv.del(postKey(slug))
  const slugs = (await kv.get(INDEX_KEY)) || []
  await kv.set(
    INDEX_KEY,
    slugs.filter((s) => s !== slug)
  )
}
