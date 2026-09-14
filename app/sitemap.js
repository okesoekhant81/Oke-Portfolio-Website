import { SITE_URL } from '../lib/site'
import { getPosts } from '../lib/content/posts'

export default async function sitemap() {
  const posts = await getPosts()

  const postEntries = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
  }))

  // getPosts() already sorts newest-first, so this is a real signal (the
  // index last changed whenever the latest post went up) rather than a
  // guess — home/workshop/privacy have no tracked "last edited" timestamp
  // to draw the same honest value from, so they're left without one.
  const latestPostDate = posts[0]?.publishedAt ? new Date(posts[0].publishedAt) : undefined

  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/workshop`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8, lastModified: latestPostDate },
    ...postEntries,
  ]
}
