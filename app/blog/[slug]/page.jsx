import { notFound } from 'next/navigation'
import { after } from 'next/server'
import Image from 'next/image'
import Link from 'next/link'
import ArticleCard from '../../../components/ArticleCard'
import Contact from '../../../components/Contact'
import LikeButton from '../../../components/LikeButton'
import NavMenu from '../../../components/NavMenu'
import Reveal from '../../../components/Reveal'
import RichText from '../../../components/RichText'
import ShareButton from '../../../components/ShareButton'
import ViewCount from '../../../components/ViewCount'
import { getPost, getPosts } from '../../../lib/content/posts'
import { getHomepageContent } from '../../../lib/content/homepage'
import { getAnalytics, getPostLikes, recordView } from '../../../lib/content/analytics'
import { getLocale } from '../../../lib/i18n'
import { localizeHomepageContent, localizePost } from '../../../lib/localizeContent'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../../../lib/dictionaries'
import { SITE_URL, SITE_NAME } from '../../../lib/site'
import { safeJsonLd } from '../../../lib/jsonLd'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const [rawPost, locale] = await Promise.all([getPost(slug), getLocale()])
  if (!rawPost) return {}
  const post = localizePost(rawPost, locale)
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
      locale: locale === 'my' ? 'my_MM' : 'en_US',
    },
  }
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const [rawPost, allPosts, rawContent, locale, { postViews }, postLikes] = await Promise.all([
    getPost(slug),
    getPosts(),
    getHomepageContent(),
    getLocale(),
    getAnalytics(),
    getPostLikes(),
  ])
  const dict = getDictionary(locale)

  if (!rawPost) notFound()

  // Deferred past the response so a slow Blob write never delays the page.
  after(() => recordView(slug))

  const post = { ...localizePost(rawPost, locale), views: postViews[slug] || 0 }
  const content = localizeHomepageContent(rawContent, locale)

  // Posts sharing at least one tag come first (still newest-first among
  // themselves, since allPosts already is), topped up with plain recency
  // once tag matches run out — a post with no tags, or no matches, just
  // falls back to the old recency-only behavior.
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug)
  const currentTags = new Set(post.tags || [])
  const tagMatches = currentTags.size > 0 ? otherPosts.filter((p) => (p.tags || []).some((t) => currentTags.has(t))) : []
  const matchedSlugs = new Set(tagMatches.map((p) => p.slug))
  const relatedPosts = [...tagMatches, ...otherPosts.filter((p) => !matchedSlugs.has(p.slug))]
    .slice(0, 4)
    .map((related) => ({ ...localizePost(related, locale), views: postViews[related.slug] || 0 }))

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
    inLanguage: locale,
    ...(post.tags?.length > 0 && { keywords: post.tags.join(', ') }),
  }

  return (
    <main className="dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 border-b border-brand/40 pb-0.5 text-xs text-brand transition-colors duration-300 hover:border-brand hover:text-ink dark:hover:text-white"
        >
          <span aria-hidden="true">&larr;</span> {dict.blog.allArticles}
        </Link>

        <Reveal delay={0.05}>
          {post.coverImageUrl && (
            <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-[10px] lg:aspect-[16/9]">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1024px) 768px, (min-width: 640px) 672px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          {(post.publishedAt || post.views) && (
            <p
              className={`mt-6 flex items-center gap-1.5 font-display text-xs text-muted dark:text-neutral-400 ${italicIfLatin(locale)}`}
            >
              {post.publishedAt && (
                <span>
                  {new Date(post.publishedAt).toLocaleDateString(dict.locale.dateLocale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {post.publishedAt && post.views ? <span aria-hidden="true">&middot;</span> : null}
              <ViewCount count={post.views} />
            </p>
          )}

          <h1
            className={`mt-2 font-display text-2xl font-bold text-ink sm:text-3xl md:text-4xl dark:text-neutral-100 ${italicIfLatin(locale)} ${headingLeading(locale)} ${headingGap(locale)}`}
          >
            {post.title}
          </h1>

          <RichText
            value={post.body}
            locale={locale}
            className="text-sm leading-relaxed text-ink sm:text-base dark:text-neutral-100"
          />

          <div className="mt-8 flex items-center gap-3">
            <LikeButton slug={post.slug} initialCount={postLikes[post.slug] || 0} locale={locale} />
            <ShareButton url={`${SITE_URL}/blog/${post.slug}`} title={post.title} locale={locale} />
          </div>
        </Reveal>

        {relatedPosts.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <Reveal>
              <h2 className={`font-display text-base font-bold text-brand sm:text-lg ${italicIfLatin(locale)} ${headingLeading(locale)}`}>
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
        locale={locale}
      />
    </main>
  )
}
