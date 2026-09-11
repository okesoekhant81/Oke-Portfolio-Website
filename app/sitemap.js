import { SITE_URL } from '../lib/site'
import { getPosts } from '../lib/content/posts'

export default async function sitemap() {
  const posts = await getPosts()

  const postEntries = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
  }))

  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    ...postEntries,
  ]
}
