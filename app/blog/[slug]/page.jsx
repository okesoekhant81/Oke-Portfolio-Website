import { notFound } from 'next/navigation'
import { after } from 'next/server'
import Link from 'next/link'
import ArticleCard from '../../../components/ArticleCard'
import Contact from '../../../components/Contact'
import NavMenu from '../../../components/NavMenu'
import Reveal from '../../../components/Reveal'
import RichText from '../../../components/RichText'
import { getPost, getPosts } from '../../../lib/content/posts'
import { getHomepageContent } from '../../../lib/content/homepage'
import { recordView } from '../../../lib/content/analytics'
import { getLocale } from '../../../lib/i18n'
import { getDictionary, italicIfLatin } from '../../../lib/dictionaries'
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
  const [post, allPosts, content, locale] = await Promise.all([
    getPost(slug),
    getPosts(),
    getHomepageContent(),
    getLocale(),
  ])
  const dict = getDictionary(locale)

  if (!post) notFound()

  // Deferred past the response so a slow Blob write never delays the page.
  after(() => recordView(slug))

  // Recency-only, capped at four, no filtering by topic or tags — kept
  // deliberately simple per the design brief.
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 4)

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
    <main className="dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 border-b border-brand/40 pb-0.5 text-xs text-brand transition-colors duration-300 hover:border-brand hover:text-ink dark:hover:text-white"
        >
          <span aria-hidden="true">&larr;</span> {dict.blog.allArticles}
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
            <p className="mt-6 font-display text-xs italic text-muted dark:text-neutral-400">
              {new Date(post.publishedAt).toLocaleDateString(dict.locale.dateLocale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          <h1 className="mt-2 font-display text-2xl font-bold italic text-ink sm:text-3xl md:text-4xl dark:text-neutral-100">
            {post.title}
          </h1>

          <RichText value={post.body} className="text-sm leading-relaxed text-ink sm:text-base dark:text-neutral-100" />
        </Reveal>

        {relatedPosts.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <Reveal>
              <h2 className={`font-display text-base font-bold text-brand sm:text-lg ${italicIfLatin(locale)}`}>
                {dict.blog.youMayLike}
              </h2>
            </Reveal>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {relatedPosts.map((related, i) => (
                <ArticleCard key={related.slug} post={related} variant="square" locale={locale} delay={i * 0.05} />
              ))}
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
