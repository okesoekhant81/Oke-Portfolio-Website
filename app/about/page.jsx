import Link from 'next/link'
import Contact from '../../components/Contact'
import NavMenu from '../../components/NavMenu'
import Reveal from '../../components/Reveal'
import RichText from '../../components/RichText'
import { getAboutContent } from '../../lib/content/about'
import { getHomepageContent } from '../../lib/content/homepage'
import { getLocale } from '../../lib/i18n'
import { localizeAboutContent, localizeHomepageContent } from '../../lib/localizeContent'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../../lib/dictionaries'
import { SITE_URL } from '../../lib/site'

export async function generateMetadata() {
  const [rawContent, locale] = await Promise.all([getAboutContent(), getLocale()])
  const content = localizeAboutContent(rawContent, locale)
  const title = `${content.heroTitle} ${content.heroSubtitle}`
  const description = content.intro.split('\n')[0]

  return {
    title,
    description,
    alternates: { canonical: '/about' },
    openGraph: {
      url: `${SITE_URL}/about`,
      title,
      description,
      locale: locale === 'my' ? 'my_MM' : 'en_US',
    },
  }
}

export default async function AboutPage() {
  const [rawContent, rawHomepage, locale] = await Promise.all([getAboutContent(), getHomepageContent(), getLocale()])
  const dict = getDictionary(locale)
  const content = localizeAboutContent(rawContent, locale)
  const homepage = localizeHomepageContent(rawHomepage, locale)
  const skills = content.skills.split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <main className="dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border-b border-brand/40 pb-0.5 text-xs text-brand transition-colors duration-300 hover:border-brand hover:text-ink dark:hover:text-white"
        >
          <span aria-hidden="true">&larr;</span> {dict.workshop.backToHome}
        </Link>

        <Reveal delay={0.05}>
          <h1
            className={`mt-6 font-display text-2xl font-bold text-ink sm:text-3xl md:text-4xl dark:text-neutral-100 ${headingLeading(locale)} ${headingGap(locale)}`}
          >
            <span className="block">{content.heroTitle}</span>
            <span className={`block text-brand ${italicIfLatin(locale)}`}>{content.heroSubtitle}</span>
          </h1>
          <p className={`mt-1 font-display text-sm font-bold text-muted sm:text-base dark:text-neutral-400 ${italicIfLatin(locale)}`}>
            {content.roleLine}
          </p>

          <RichText
            value={content.intro}
            locale={locale}
            className="text-sm leading-relaxed text-ink sm:text-base dark:text-neutral-100"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {content.stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className={`font-display text-2xl font-bold text-brand sm:text-3xl ${italicIfLatin(locale)}`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted dark:text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <h2
            className={`mt-12 font-display text-xl font-bold text-brand sm:text-2xl ${italicIfLatin(locale)} ${headingLeading(locale)}`}
          >
            {content.experienceHeading}
          </h2>
          <div className="mt-4 space-y-6">
            {content.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-brand/30 pl-4 dark:border-brand/40">
                <p className={`font-display text-sm font-bold text-ink sm:text-base dark:text-neutral-100 ${headingLeading(locale)}`}>
                  {exp.role}
                </p>
                <p className="mt-0.5 text-xs text-muted dark:text-neutral-400">
                  {exp.company} · {exp.location} · {exp.period}
                </p>
                {exp.achievement && (
                  <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base dark:text-neutral-100">
                    {exp.achievement}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {skills.length > 0 && (
          <Reveal delay={0.2}>
            <h2
              className={`mt-12 font-display text-xl font-bold text-brand sm:text-2xl ${italicIfLatin(locale)} ${headingLeading(locale)}`}
            >
              {content.skillsHeading}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-ink dark:border-neutral-800 dark:text-neutral-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Reveal>
        )}
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
