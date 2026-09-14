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
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
              >
                <Link href={`/admin/posts/${post.slug}/edit`} className="group block">
                  <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt=""
                        className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="truncate font-display text-base font-bold italic text-ink">{post.title}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'no date'}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
                  <Link href={`/admin/posts/${post.slug}/edit`} className="text-sm text-brand hover:underline">
                    Edit
                  </Link>
                  <form action={deletePostAction}>
                    <input type="hidden" name="slug" value={post.slug} />
                    <DeleteButton confirmText={`Delete "${post.title}"? This can't be undone.`} />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
