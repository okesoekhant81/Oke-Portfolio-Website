import { notFound } from 'next/navigation'
import Link from 'next/link'
import ArticleCard from '../../../components/ArticleCard'
import Contact from '../../../components/Contact'
import NavMenu from '../../../components/NavMenu'
import Reveal from '../../../components/Reveal'
import RichText from '../../../components/RichText'
import { getPost, getPosts } from '../../../lib/content/posts'
import { getHomepageContent } from '../../../lib/content/homepage'
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
  const [post, allPosts, content] = await Promise.all([getPost(slug), getPosts(), getHomepageContent()])

  if (!post) notFound()

  // Recency-only, capped at three, no filtering by topic or tags — kept
  // deliberately simple per the design brief.
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3)
  const [relatedA, relatedB, relatedC] = relatedPosts

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
    <main>
      <NavMenu />
      <div className="mx-auto max-w-2xl px-6 pt-20 pb-14 sm:px-12 sm:pt-24 sm:pb-16 md:px-16 lg:max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 border-b border-brand/40 pb-0.5 text-xs text-brand transition-colors duration-300 hover:border-brand hover:text-ink"
        >
          <span aria-hidden="true">&larr;</span> All articles
        </Link>

        <Reveal delay={0.05}>
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt=""
              className="mt-6 aspect-square w-full rounded-[10px] object-cover lg:aspect-[16/9]"
            />
          )}
        </Reveal>

        <Reveal delay={0.1}>
          {post.publishedAt && (
            <p className="mt-6 font-display text-xs italic text-muted">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          <h1 className="mt-2 font-display text-2xl font-bold italic text-ink sm:text-3xl md:text-4xl">
            {post.title}
          </h1>

          <RichText value={post.body} className="text-sm leading-relaxed text-ink sm:text-base" />
        </Reveal>

        {relatedA && (
          <div className="mt-16 sm:mt-20">
            <Reveal>
              <h2 className="font-display text-base font-bold italic text-brand sm:text-lg">Articles You May Like</h2>
            </Reveal>
            <div className="mt-6 space-y-4">
              {(relatedA || relatedB) && (
                <div className="grid grid-cols-2 gap-4">
                  {relatedA && <ArticleCard post={relatedA} variant="square" />}
                  {relatedB && <ArticleCard post={relatedB} variant="square" delay={0.05} />}
                </div>
              )}
              {relatedC && <ArticleCard post={relatedC} variant="wide" delay={0.1} />}
            </div>
          </div>
        )}
      </div>

      <Contact
        line1={content.contactLine1}
        line2={content.contactLine2}
        body={content.contactBody}
        cta={content.contactCta}
        email={content.contactEmail}
        copyright={content.contactCopyright}
        tagline={content.contactTagline}
      />
    </main>
  )
}
