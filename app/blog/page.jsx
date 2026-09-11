import ArticleCard from '../../components/ArticleCard'
import Contact from '../../components/Contact'
import NavMenu from '../../components/NavMenu'
import Reveal from '../../components/Reveal'
import { getPosts } from '../../lib/content/posts'
import { getHomepageContent } from '../../lib/content/homepage'
import { getLocale } from '../../lib/i18n'
import { localizeHomepageContent, localizePost } from '../../lib/localizeContent'
import { getDictionary, italicIfLatin } from '../../lib/dictionaries'
import { SITE_URL } from '../../lib/site'

export const metadata = {
  title: 'Articles',
  description: 'Writing on brand strategy, marketing, content, and digital growth from Oke Soe Khant.',
  alternates: { canonical: '/blog' },
  openGraph: { url: `${SITE_URL}/blog`, title: 'Articles' },
}

// The design repeats a 4-post cluster — one large featured card, two square
// cards side by side, then one wide card — for as many posts as exist.
function chunk(items, size) {
  const groups = []
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size))
  return groups
}

export default async function BlogIndex() {
  const [rawPosts, rawContent, locale] = await Promise.all([getPosts(), getHomepageContent(), getLocale()])
  const dict = getDictionary(locale)
  const content = localizeHomepageContent(rawContent, locale)
  const posts = rawPosts.map((post) => localizePost(post, locale))
  const groups = chunk(posts, 4)

  return (
    <main className="dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-4xl">
        <Reveal>
          <h1 className={`font-display text-4xl font-bold text-brand sm:text-5xl ${italicIfLatin(locale)}`}>
            {dict.blog.heading}
          </h1>
        </Reveal>

        {posts.length === 0 ? (
          <p className="mt-10 text-sm leading-relaxed text-muted sm:text-base dark:text-neutral-400">{dict.blog.empty}</p>
        ) : (
          <div className="mt-10 space-y-4 sm:mt-14 lg:space-y-6">
            {groups.map((group, i) => {
              const [featured, squareA, squareB, wide] = group
              return (
                <div key={i} className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                  {featured && (
                    <ArticleCard post={featured} variant="featured" locale={locale} className="col-span-2 lg:row-span-2" />
                  )}
                  {squareA && (
                    <ArticleCard
                      post={squareA}
                      variant="square"
                      locale={locale}
                      delay={0.05}
                      className="lg:col-start-3 lg:row-start-1"
                    />
                  )}
                  {squareB && (
                    <ArticleCard
                      post={squareB}
                      variant="square"
                      locale={locale}
                      delay={0.1}
                      className="lg:col-start-3 lg:row-start-2"
                    />
                  )}
                  {wide && (
                    <ArticleCard
                      post={wide}
                      variant="wide"
                      locale={locale}
                      delay={0.05}
                      className="col-span-2 lg:col-span-3"
                    />
                  )}
                </div>
              )
            })}
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
