import Image from 'next/image'
import Link from 'next/link'
import Contact from '../../components/Contact'
import NavMenu from '../../components/NavMenu'
import FAQAccordion from '../../components/FAQAccordion'
import RegistrationForm from '../../components/RegistrationForm'
import Reveal from '../../components/Reveal'
import RichText from '../../components/RichText'
import Testimonials from '../../components/Testimonials'
import WorkshopOutline from '../../components/WorkshopOutline'
import { getClassDates } from '../../lib/content/classDates'
import { getHomepageContent } from '../../lib/content/homepage'
import { getStudents } from '../../lib/content/students'
import { getTestimonials } from '../../lib/content/testimonials'
import { getWorkshopContent } from '../../lib/content/workshop'
import { getLocale } from '../../lib/i18n'
import { localizeHomepageContent, localizeWorkshopContent, localizeTestimonials } from '../../lib/localizeContent'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../../lib/dictionaries'
import { SITE_URL, SITE_NAME } from '../../lib/site'
import { safeJsonLd, buildBreadcrumbJsonLd } from '../../lib/jsonLd'

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
  const [rawContent, rawHomepage, locale, classDates, students, rawTestimonials] = await Promise.all([
    getWorkshopContent(),
    getHomepageContent(),
    getLocale(),
    getClassDates(),
    getStudents(),
    getTestimonials(),
  ])
  const dict = getDictionary(locale)
  const content = localizeWorkshopContent(rawContent, locale)
  const homepage = localizeHomepageContent(rawHomepage, locale)
  const testimonials = localizeTestimonials(rawTestimonials, locale)

  const inProgressClass = classDates.find((d) => d.status === 'in-progress')
  const inProgressCount = inProgressClass
    ? students.filter((s) => s.classDate === inProgressClass.date).length
    : 0
  // Same slot the in-progress card used to occupy — once that cohort's
  // status flips to 'completed', it used to just vanish from this spot
  // instead of leaving something in its place. Only shown when nothing is
  // actually in progress (a real active cohort is stronger social proof
  // than a finished one), and only the most recent completed class, not
  // every one that's ever run.
  const recentlyCompleted = inProgressClass
    ? null
    : classDates.filter((d) => d.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0]
  const recentlyCompletedCount = recentlyCompleted
    ? students.filter((s) => s.classDate === recentlyCompleted.date).length
    : 0
  // A completed class nobody actually attended isn't social proof of
  // anything — skip it rather than showing "0 students recently finished".
  const showRecentlyCompleted = Boolean(recentlyCompleted) && recentlyCompletedCount > 0
  const nextUpcoming = classDates
    .filter((d) => d.status !== 'completed' && d.date !== inProgressClass?.date)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  // Only 'upcoming' classes are choosable in the registration form — once
  // a class is in progress or completed, it's not something a new
  // registration should be able to join through this form, no matter how
  // many seats a headcount would still say are free. Missing/legacy
  // status is treated as upcoming (open), matching the fallback used
  // everywhere else a class's status is displayed.
  // capacity of 0 means unlimited — seatsLeft/isFull are left undefined in
  // that case rather than computed as Infinity, so the form can tell "no
  // cap set" apart from "cap set but nobody's registered yet".
  const registrableClassDates = classDates
    .filter((d) => !d.status || d.status === 'upcoming')
    .map((d) => {
      if (!d.capacity) return d
      const registered = students.filter((s) => s.classDate === d.date).length
      return { ...d, seatsLeft: Math.max(d.capacity - registered, 0), isFull: registered >= d.capacity }
    })

  function formatClassDate(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(dict.locale.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Only approved testimonials with an actual star rating count toward the
  // aggregate — a pending submission or a legacy row saved before ratings
  // existed shouldn't silently drag the average down or inflate the count.
  const ratedTestimonials = testimonials.filter((t) => t.status !== 'pending' && t.quote && t.rating)
  const averageRating =
    ratedTestimonials.length > 0
      ? ratedTestimonials.reduce((sum, t) => sum + t.rating, 0) / ratedTestimonials.length
      : 0

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
      // A class with a Meet link is actually run online, not in person —
      // hardcoding 'Onsite' regardless stopped being accurate once classes
      // could carry their own meetingLink (see lib/content/classDates.js).
      hasCourseInstance: classDates.map((d) => ({
        '@type': 'CourseInstance',
        courseMode: d.meetingLink ? 'Online' : 'Onsite',
        ...(d.meetingLink && { location: { '@type': 'VirtualLocation', url: d.meetingLink } }),
        startDate: d.date,
      })),
    }),
    // Same rule as above — real admin-approved reviews only, skipped
    // entirely rather than emitting an aggregateRating with reviewCount: 0,
    // which search engines and AI answer engines would treat as a claim.
    ...(ratedTestimonials.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(averageRating.toFixed(1)),
        reviewCount: ratedTestimonials.length,
      },
      review: ratedTestimonials.map((t) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: t.name },
        reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5, worstRating: 1 },
        reviewBody: t.quote,
      })),
    }),
  }

  // FAQPage is one of the schema types search engines and AI answer
  // engines lift Q&A pairs from directly — skipped entirely (not an
  // empty mainEntity array) when no FAQ has been filled in yet, same
  // as hasCourseInstance above.
  const answeredFaqs = content.faqs.filter((f) => f.question)
  const faqJsonLd = answeredFaqs.length > 0 && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: answeredFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: dict.nav.home, url: SITE_URL },
    { name: `${content.heroTitle} ${content.heroSubtitle}`, url: `${SITE_URL}/workshop` },
  ])

  return (
    <main className="dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(courseJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
        {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />}

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

        {(inProgressClass || showRecentlyCompleted || nextUpcoming) && (
          <Reveal delay={0.12}>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {inProgressClass && (
                <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 dark:border-brand/40 dark:bg-brand/10">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-brand" aria-hidden="true" />
                    {dict.workshop.cohortActiveLabel}
                  </p>
                  <p className="mt-1 text-sm text-ink dark:text-neutral-100">
                    <span className="font-bold">{inProgressCount}</span> {dict.workshop.cohortActiveBody}
                  </p>
                </div>
              )}
              {showRecentlyCompleted && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-600 dark:bg-green-400" aria-hidden="true" />
                    {dict.workshop.cohortCompletedLabel}
                  </p>
                  <p className="mt-1 text-sm text-ink dark:text-neutral-100">
                    <span className="font-bold">{recentlyCompletedCount}</span> {dict.workshop.cohortCompletedBody}
                  </p>
                </div>
              )}
              {nextUpcoming && (
                <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                  <p className="text-xs font-semibold text-muted dark:text-neutral-400">{dict.workshop.nextCohortLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-ink dark:text-neutral-100">
                    {formatClassDate(nextUpcoming.date)}
                    {nextUpcoming.label ? ` — ${nextUpcoming.label}` : ''}
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        )}

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

        <Reveal delay={0.22}>
          <FAQAccordion heading={content.faqHeading} faqs={content.faqs} locale={locale} />
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
              <RegistrationForm
                locale={locale}
                classDates={registrableClassDates}
                paymentMethods={content.paymentMethods.filter((m) => m.name)}
              />
            </div>
          </div>
        </Reveal>
      </div>

      <Testimonials testimonials={testimonials} locale={locale} />

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
