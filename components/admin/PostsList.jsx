'use client'

import Link from 'next/link'
import DeleteButton from './DeleteButton'
import { useSearchFilter, SearchBar } from './SearchFilterBar'
import { deletePostAction } from '../../app/actions/posts'

export default function PostsList({ posts }) {
  const { query, setQuery, filtered } = useSearchFilter(posts, { searchKeys: ['title', 'excerpt'] })

  return (
    <>
      <div className="mt-6">
        <SearchBar value={query} onChange={setQuery} placeholder="Search articles…" />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No articles match your search.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
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
    </>
  )
}
