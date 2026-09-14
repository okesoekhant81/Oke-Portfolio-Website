import Image from 'next/image'
import Link from 'next/link'
import Contact from '../../components/Contact'
import NavMenu from '../../components/NavMenu'
import RegistrationForm from '../../components/RegistrationForm'
import Reveal from '../../components/Reveal'
import RichText from '../../components/RichText'
import WorkshopOutline from '../../components/WorkshopOutline'
import { getClassDates } from '../../lib/content/classDates'
import { getHomepageContent } from '../../lib/content/homepage'
import { getWorkshopContent } from '../../lib/content/workshop'
import { getLocale } from '../../lib/i18n'
import { localizeHomepageContent, localizeWorkshopContent } from '../../lib/localizeContent'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../../lib/dictionaries'
import { SITE_URL, SITE_NAME } from '../../lib/site'

export async function generateMetadata() {
  const [rawContent, locale] = await Promise.all([getWorkshopContent(), getLocale()])
  const content = localizeWorkshopContent(rawContent, locale)
  const title = `${content.heroTitle} ${content.heroSubtitle}`
  const description = content.intro.split('\n')[0]

  return {
    title,
    description,
    alternates: { canonical: '/workshop' },
    openGraph: {
      url: `${SITE_URL}/workshop`,
      title,
      description,
      images: [{ url: content.heroImage }],
      locale: locale === 'my' ? 'my_MM' : 'en_US',
    },
  }
}

export default async function WorkshopPage() {
  const [rawContent, rawHomepage, locale, classDates] = await Promise.all([
    getWorkshopContent(),
    getHomepageContent(),
    getLocale(),
    getClassDates(),
  ])
  const dict = getDictionary(locale)
  const content = localizeWorkshopContent(rawContent, locale)
  const homepage = localizeHomepageContent(rawHomepage, locale)

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${content.heroTitle} ${content.heroSubtitle}`,
    description: content.intro.split('\n')[0],
    provider: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/workshop` },
    inLanguage: locale,
    // Real admin-managed dates, when there are any — not fabricated, and
    // skipped entirely rather than guessed at when the list is empty.
    ...(classDates.length > 0 && {
      hasCourseInstance: classDates.map((d) => ({
        '@type': 'CourseInstance',
        courseMode: 'Onsite',
        startDate: d.date,
      })),
    }),
  }

  return (
    <main className="dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border-b border-brand/40 pb-0.5 text-xs text-brand transition-colors duration-300 hover:border-brand hover:text-ink dark:hover:text-white"
        >
          <span aria-hidden="true">&larr;</span> {dict.workshop.backToHome}
        </Link>

        <Reveal delay={0.05}>
          <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-[10px] lg:aspect-[16/9]">
            <Image
              src={content.heroImage}
              alt={`${content.heroTitle} ${content.heroSubtitle}`}
              fill
              priority
              sizes="(min-width: 1024px) 768px, (min-width: 640px) 672px, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1
            className={`mt-6 font-display text-2xl font-bold text-ink sm:text-3xl md:text-4xl dark:text-neutral-100 ${headingLeading(locale)} ${headingGap(locale)}`}
          >
            <span className="block">{content.heroTitle}</span>
            <span className={`block text-brand ${italicIfLatin(locale)}`}>{content.heroSubtitle}</span>
          </h1>

          <RichText
            value={content.intro}
            locale={locale}
            className="text-sm leading-relaxed text-ink sm:text-base dark:text-neutral-100"
          />
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted dark:text-neutral-400">{content.formatLabel}</p>
              <p className="mt-1 text-sm font-semibold text-ink dark:text-neutral-100">{content.format}</p>
            </div>
            <div>
              <p className="text-xs text-muted dark:text-neutral-400">{content.durationLabel}</p>
              <p className="mt-1 text-sm font-semibold text-ink dark:text-neutral-100">{content.duration}</p>
            </div>
            <div>
              <p className="text-xs text-muted dark:text-neutral-400">{content.audienceLabel}</p>
              <p className="mt-1 text-sm font-semibold text-ink dark:text-neutral-100">{content.audience}</p>
            </div>
            <div
              className={
                content.promoPrice
                  ? '-m-2 rounded-lg border border-brand/30 bg-brand/5 p-2 dark:border-brand/40 dark:bg-brand/10'
                  : ''
              }
            >
              <p className="text-xs text-muted dark:text-neutral-400">{content.priceLabel}</p>
              {content.promoPrice ? (
                <p className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className={`font-display text-xl font-bold text-brand sm:text-2xl ${italicIfLatin(locale)}`}>
                    {content.promoPrice}
                  </span>
                  <span className="text-xs text-muted line-through dark:text-neutral-500">{content.price}</span>
                </p>
              ) : (
                <p className="mt-1 text-sm font-semibold text-ink dark:text-neutral-100">{content.price}</p>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <h2
            className={`mt-12 font-display text-xl font-bold text-brand sm:text-2xl ${italicIfLatin(locale)} ${headingLeading(locale)}`}
          >
            {content.outlineHeading}
          </h2>
          <div className="mt-4">
            <WorkshopOutline modules={content.modules} locale={locale} />
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-white/5 sm:p-8">
            <h2
              className={`font-display text-xl font-bold text-ink sm:text-2xl dark:text-neutral-100 ${italicIfLatin(locale)} ${headingLeading(locale)}`}
            >
              {content.ctaHeading}
            </h2>
            <p className="mt-2 text-sm text-muted dark:text-neutral-400">{content.ctaBody}</p>
            <div className="mt-6">
              <RegistrationForm locale={locale} classDates={classDates} />
            </div>
          </div>
        </Reveal>
      </div>

      <Contact
        line1={homepage.contactLine1}
        line2={homepage.contactLine2}
        body={homepage.contactBody}
        cta={homepage.contactCta}
        email={homepage.contactEmail}
        copyright={homepage.contactCopyright}
        tagline={homepage.contactTagline}
        locale={locale}
      />
    </main>
  )
}
