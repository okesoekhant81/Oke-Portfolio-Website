'use server'

import { readJson } from '../../lib/blobStore'

const ALL_POSTS_PATH = 'content/posts-all.json'

// Temporary diagnostic — investigating a report that a recently-created
// article shows its cover image on the public page but not its title/date/
// body, while the admin editor shows all fields populated. Since both admin
// and public reads go through the exact same getPost(), the leading
// hypothesis is a duplicate slug in the stored array (an incomplete early
// entry sitting before the real one, so .find() returns the wrong one).
// Remove this file and its admin UI once the cause is confirmed and fixed.
export async function debugPostsAction() {
  const posts = (await readJson(ALL_POSTS_PATH)) || []

  const bySlug = {}
  posts.forEach((p, i) => {
    bySlug[p.slug] = bySlug[p.slug] || []
    bySlug[p.slug].push(i)
  })
  const duplicateSlugs = Object.entries(bySlug)
    .filter(([, indexes]) => indexes.length > 1)
    .map(([slug, indexes]) => ({ slug, indexes }))

  const summarize = (p, index) => ({
    index,
    slug: p.slug,
    title: p.title,
    titleMy: p.titleMy,
    bodyLength: p.body?.length || 0,
    bodyMyLength: p.bodyMy?.length || 0,
    coverImageUrl: p.coverImageUrl,
    status: p.status,
    publishedAt: p.publishedAt,
    deletedAt: p.deletedAt || null,
  })

  const last5 = posts.slice(-5).map((p, i) => summarize(p, posts.length - Math.min(5, posts.length) + i))
  const duplicateEntries = duplicateSlugs.flatMap(({ indexes }) => indexes.map((i) => summarize(posts[i], i)))

  return { totalCount: posts.length, duplicateSlugs, last5, duplicateEntries }
}
