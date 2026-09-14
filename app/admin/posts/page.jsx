import Link from 'next/link'
import AdminNav from '../../../components/admin/AdminNav'
import PostsList from '../../../components/admin/PostsList'
import { getPosts } from '../../../lib/content/posts'

export const dynamic = 'force-dynamic'

export default async function PostsAdminPage() {
  const posts = await getPosts({ includeUnpublished: true })

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/posts" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold italic text-brand">Articles</h1>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            New article
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">No articles yet — create your first one.</p>
        ) : (
          <PostsList posts={posts} />
        )}
      </div>
    </main>
  )
}
