import { notFound } from 'next/navigation'
import AdminNav from '../../../../../components/admin/AdminNav'
import PostForm from '../../../../../components/admin/PostForm'
import { getPost } from '../../../../../lib/content/posts'

export default async function EditPostPage({ params }) {
  const { slug } = await params
  const post = await getPost(slug, { includeUnpublished: true })

  if (!post) notFound()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/posts" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Edit article</h1>
        <PostForm post={post} />
      </div>
    </main>
  )
}
