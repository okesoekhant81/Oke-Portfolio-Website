'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { savePost, deletePost, restorePost, permanentlyDeletePost } from '../../lib/content/posts'
import { slugify } from '../../lib/slugify'
import { logActivity } from '../../lib/activityLog'

export async function savePostAction(prevState, formData) {
  const get = (name) => formData.get(name)?.toString() ?? ''

  const title = get('title').trim()
  if (!title) return { error: 'Title is required.' }

  const slug = slugify(get('slug') || title)
  if (!slug) return { error: 'Could not generate a slug from that title.' }

  const previousSlug = get('previousSlug') || undefined

  const tags = [...new Set(get('tags').split(',').map((t) => t.trim()).filter(Boolean))].slice(0, 10)

  const post = {
    title,
    titleMy: get('titleMy'),
    slug,
    excerpt: get('excerpt'),
    excerptMy: get('excerptMy'),
    coverImageUrl: get('coverImageUrl') || null,
    publishedAt: get('publishedAt') || new Date().toISOString(),
    body: get('body'),
    bodyMy: get('bodyMy'),
    tags,
    status: get('status') === 'draft' ? 'draft' : 'published',
  }

  try {
    await savePost(post, previousSlug && previousSlug !== slug ? previousSlug : undefined)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  await logActivity(previousSlug ? 'Article updated' : 'Article created', post.title)
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

  await logActivity('Article deleted', slug)
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/admin/posts')
  revalidatePath('/sitemap.xml')
}

export async function restorePostAction(formData) {
  const slug = formData.get('slug')?.toString()
  if (!slug) return

  await restorePost(slug)

  await logActivity('Article restored', slug)
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/admin/posts')
  revalidatePath('/admin/trash')
  revalidatePath('/sitemap.xml')
}

export async function permanentlyDeletePostAction(formData) {
  const slug = formData.get('slug')?.toString()
  if (!slug) return

  await permanentlyDeletePost(slug)

  await logActivity('Article permanently deleted', slug)
  revalidatePath('/admin/trash')
}
