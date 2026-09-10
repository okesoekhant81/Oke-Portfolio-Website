import { client } from '../sanity/lib/client'
import { urlFor } from '../sanity/lib/image'
import { isSanityConfigured } from '../sanity/env'

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc){
  title, "slug": slug.current, excerpt, coverImage, publishedAt
}`

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title, "slug": slug.current, excerpt, coverImage, publishedAt, body
}`

export async function getPosts() {
  if (!isSanityConfigured) return []
  try {
    const posts = await client.fetch(POSTS_QUERY)
    return posts.map((post) => ({
      ...post,
      coverImageUrl: post.coverImage?.asset ? urlFor(post.coverImage).width(800).url() : null,
    }))
  } catch {
    return []
  }
}

export async function getPost(slug) {
  if (!isSanityConfigured) return null
  try {
    const post = await client.fetch(POST_QUERY, { slug })
    if (!post) return null
    return {
      ...post,
      coverImageUrl: post.coverImage?.asset ? urlFor(post.coverImage).width(1200).url() : null,
    }
  } catch {
    return null
  }
}
