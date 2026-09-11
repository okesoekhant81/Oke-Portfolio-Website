import { notFound } from 'next/navigation'
import Link from 'next/link'
import RichText from '../../../components/RichText'
import { getPost } from '../../../lib/content/posts'
import { SITE_URL, SITE_NAME } from '../../../lib/site'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/blog/${slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  }
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-12 sm:py-16 md:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
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
        <img src={post.coverImageUrl} alt={post.title} className="mt-6 aspect-video w-full rounded-lg object-cover" />
      )}

      <RichText value={post.body} className="text-sm leading-relaxed text-ink sm:text-base" />
    </main>
  )
}
