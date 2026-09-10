import Link from 'next/link'
import { getPosts } from '../../lib/blog'

export const metadata = {
  title: 'Articles — Oke Soe Khant',
}

export default async function BlogIndex() {
  const posts = await getPosts()

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-12 sm:py-16 md:px-16">
      <h1 className="text-4xl text-ink sm:text-5xl">
        <span className="font-display font-bold italic text-brand">Articles</span>
      </h1>

      {posts.length === 0 ? (
        <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
          No articles published yet — check back soon.
        </p>
      ) : (
        <ul className="mt-10 space-y-10">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-black/10 pb-10 last:border-none">
              <Link href={`/blog/${post.slug}`} className="group block">
                {post.coverImageUrl && (
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="mb-4 aspect-video w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                )}
                <h2 className="font-display text-xl font-bold italic text-ink">{post.title}</h2>
                {post.excerpt && <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
                {post.publishedAt && (
                  <p className="mt-3 text-xs text-muted">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
