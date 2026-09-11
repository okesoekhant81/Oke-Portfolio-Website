import Link from 'next/link'
import AdminNav from '../../../components/admin/AdminNav'
import DeleteButton from '../../../components/admin/DeleteButton'
import { getPosts } from '../../../lib/content/posts'
import { deletePostAction } from '../../actions/posts'

export const dynamic = 'force-dynamic'

export default async function PostsAdminPage() {
  const posts = await getPosts()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/posts" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Articles</h1>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            New article
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">No articles yet — create your first one.</p>
        ) : (
          <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
            {posts.map((post) => (
              <li key={post.slug} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{post.title}</p>
                  <p className="text-xs text-neutral-400">
                    /blog/{post.slug} ·{' '}
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'no date'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link href={`/admin/posts/${post.slug}/edit`} className="text-sm text-brand hover:underline">
                    Edit
                  </Link>
                  <form action={deletePostAction}>
                    <input type="hidden" name="slug" value={post.slug} />
                    <DeleteButton confirmText={`Delete "${post.title}"? This can't be undone.`} />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
