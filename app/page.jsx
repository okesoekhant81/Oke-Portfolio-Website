import NavMenu from '../components/NavMenu'
import Hero from '../components/Hero'
import NotJustMarketing from '../components/NotJustMarketing'
import Services from '../components/Services'
import Strategy from '../components/Strategy'
import ThingsImBuilding from '../components/ThingsImBuilding'
import Workshop from '../components/Workshop'
import Testimonials from '../components/Testimonials'
import AboutMe from '../components/AboutMe'
import LatestArticles from '../components/LatestArticles'
import Contact from '../components/Contact'
import { getHomepageContent } from '../lib/content/homepage'
import { getPosts } from '../lib/content/posts'
import { getTestimonials } from '../lib/content/testimonials'
import { getAnalytics } from '../lib/content/analytics'
import { getLocale } from '../lib/i18n'
import { localizeHomepageContent, localizePost, localizeTestimonials } from '../lib/localizeContent'
import { SITE_URL, SITE_NAME, SOCIAL_LINKS } from '../lib/site'
import { safeJsonLd } from '../lib/jsonLd'

function buildPersonJsonLd(locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    url: SITE_URL,
    jobTitle: 'Brand Strategist',
    description:
      'Brand strategy, marketing, content, and digital experience — helping businesses turn ideas into brands and brands into growth.',
    email: 'hello@okesoekhant.com',
    knowsAbout: [
      'Brand Strategy',
      'Brand Positioning',
      'Digital Marketing',
      'Content Strategy',
      'Digital Experience Design',
      'Business Growth',
    ],
    sameAs: SOCIAL_LINKS,
    mainEntityOfPage: { '@type': 'WebPage', '@id': SITE_URL },
    inLanguage: locale,
  }
}

export default async function Home() {
  const [rawContent, rawPosts, rawTestimonials, locale, { postViews }] = await Promise.all([
    getHomepageContent(),
    getPosts(),
    getTestimonials(),
    getLocale(),
    getAnalytics(),
  ])
  const content = localizeHomepageContent(rawContent, locale)
  const testimonials = localizeTestimonials(rawTestimonials, locale)
  const posts = rawPosts
    .slice(0, 4)
    .map((post) => ({ ...localizePost(post, locale), views: postViews[post.slug] || 0 }))
  const personJsonLd = buildPersonJsonLd(locale)

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(personJsonLd) }} />
      <NavMenu locale={locale} />
      <Hero
        name={content.heroName}
        body={content.heroBody}
        badgePrefix={content.heroBadgePrefix}
        badgeEmphasis={content.heroBadgeEmphasis}
        image={content.heroImage}
        locale={locale}
      />
      <NotJustMarketing
        line1={content.marketingLine1}
        line2={content.marketingLine2}
        body={content.marketingBody}
        locale={locale}
      />
      <Services services={content.services} />
      <Strategy
        line1={content.strategyLine1}
        line2={content.strategyLine2}
        paragraph={content.strategyParagraph}
        quote={content.strategyQuote}
        locale={locale}
      />
      <ThingsImBuilding
        line1={content.buildingLine1}
        line2={content.buildingLine2}
        intro={content.buildingIntro}
        emphasis={content.buildingEmphasis}
        projects={content.projects}
        locale={locale}
      />
      <Workshop
        image={content.workshopImage}
        line1={content.workshopLine1}
        line2={content.workshopLine2}
        body={content.workshopBody}
        role={content.workshopRole}
        locale={locale}
      />
      <Testimonials testimonials={testimonials} locale={locale} />
      <AboutMe line1={content.aboutLine1} line2={content.aboutLine2} body={content.aboutBody} locale={locale} />
      <LatestArticles posts={posts} locale={locale} />
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
