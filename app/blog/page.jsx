import BlogList from '../../components/BlogList'
import Contact from '../../components/Contact'
import NavMenu from '../../components/NavMenu'
import Reveal from '../../components/Reveal'
import { getPosts } from '../../lib/content/posts'
import { getHomepageContent } from '../../lib/content/homepage'
import { getAnalytics } from '../../lib/content/analytics'
import { getLocale } from '../../lib/i18n'
import { localizeHomepageContent, localizePost } from '../../lib/localizeContent'
import { getDictionary, headingLeading, italicIfLatin } from '../../lib/dictionaries'
import { SITE_URL } from '../../lib/site'
import { safeJsonLd, buildBreadcrumbJsonLd } from '../../lib/jsonLd'

export async function generateMetadata() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  return {
    title: dict.blog.heading,
    description: dict.blog.metaDescription,
    alternates: { canonical: '/blog' },
    openGraph: {
      url: `${SITE_URL}/blog`,
      title: dict.blog.heading,
      description: dict.blog.metaDescription,
      locale: locale === 'my' ? 'my_MM' : 'en_US',
    },
  }
}

export default async function BlogIndex() {
  const [rawPosts, rawContent, locale, { postViews }] = await Promise.all([
    getPosts(),
    getHomepageContent(),
    getLocale(),
    getAnalytics(),
  ])
  const dict = getDictionary(locale)
  const content = localizeHomepageContent(rawContent, locale)
  const posts = rawPosts.map((post) => ({ ...localizePost(post, locale), views: postViews[post.slug] || 0 }))
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: dict.nav.home, url: SITE_URL },
    { name: dict.nav.articles, url: `${SITE_URL}/blog` },
  ])

  return (
    <main className="dark:bg-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-4xl">
        <Reveal>
          <h1 className={`font-display text-4xl font-bold text-brand sm:text-5xl ${italicIfLatin(locale)} ${headingLeading(locale)}`}>
            {dict.blog.heading}
          </h1>
        </Reveal>

        {posts.length === 0 ? (
          <p className="mt-10 text-sm leading-relaxed text-muted sm:text-base dark:text-neutral-400">{dict.blog.empty}</p>
        ) : (
          <BlogList posts={posts} locale={locale} />
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
