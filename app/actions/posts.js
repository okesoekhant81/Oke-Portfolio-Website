'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { savePost, deletePost } from '../../lib/content/posts'
import { slugify } from '../../lib/slugify'

export async function savePostAction(prevState, formData) {
  const get = (name) => formData.get(name)?.toString() ?? ''

  const title = get('title').trim()
  if (!title) return { error: 'Title is required.' }

  const slug = slugify(get('slug') || title)
  if (!slug) return { error: 'Could not generate a slug from that title.' }

  const previousSlug = get('previousSlug') || undefined

  const post = {
    title,
    slug,
    excerpt: get('excerpt'),
    coverImageUrl: get('coverImageUrl') || null,
    publishedAt: get('publishedAt') || new Date().toISOString(),
    body: get('body'),
  }

  try {
    await savePost(post, previousSlug && previousSlug !== slug ? previousSlug : undefined)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  if (previousSlug && previousSlug !== slug) revalidatePath(`/blog/${previousSlug}`)
  revalidatePath('/admin/posts')
  revalidatePath('/sitemap.xml')

  redirect('/admin/posts')
}

export async function deletePostAction(formData) {
  const slug = formData.get('slug')?.toString()
  if (!slug) return

  await deletePost(slug)

  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/admin/posts')
  revalidatePath('/sitemap.xml')
}
