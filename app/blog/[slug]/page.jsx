import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost } from '../../../lib/blog'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Oke Soe Khant`,
    description: post.excerpt,
  }
}

const portableTextComponents = {
  marks: {
    em: ({ children }) => <em className="font-display not-italic">{children}</em>,
    strong: ({ children }) => <strong className="font-display font-bold italic">{children}</strong>,
  },
  block: {
    normal: ({ children }) => <p className="mt-4 text-sm leading-relaxed text-ink sm:text-base">{children}</p>,
    h2: ({ children }) => <h2 className="mt-8 font-display text-2xl font-bold italic text-ink">{children}</h2>,
  },
  types: {
    image: ({ value }) => (
      <img src={value.asset?.url} alt="" className="mt-6 w-full rounded-lg object-cover" />
    ),
  },
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-12 sm:py-16 md:px-16">
      <Link href="/blog" className="text-sm text-brand underline underline-offset-4">
        &larr; All articles
      </Link>

      <h1 className="mt-6 text-3xl text-ink sm:text-4xl md:text-5xl">
        <span className="font-display font-bold italic">{post.title}</span>
      </h1>

      {post.publishedAt && (
        <p className="mt-3 text-xs text-muted">
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}

      {post.coverImageUrl && (
        <img src={post.coverImageUrl} alt="" className="mt-6 aspect-video w-full rounded-lg object-cover" />
      )}

      {post.body && <PortableText value={post.body} components={portableTextComponents} />}
    </main>
  )
}
