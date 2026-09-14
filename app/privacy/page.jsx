import Contact from '../../components/Contact'
import NavMenu from '../../components/NavMenu'
import Reveal from '../../components/Reveal'
import RichText from '../../components/RichText'
import { getHomepageContent } from '../../lib/content/homepage'
import { getLocale } from '../../lib/i18n'
import { localizeHomepageContent } from '../../lib/localizeContent'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../../lib/dictionaries'
import { SITE_URL } from '../../lib/site'

export async function generateMetadata() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  return {
    title: dict.privacy.metaTitle,
    description: dict.privacy.intro,
    alternates: { canonical: '/privacy' },
    openGraph: {
      url: `${SITE_URL}/privacy`,
      title: dict.privacy.metaTitle,
      description: dict.privacy.intro,
      locale: locale === 'my' ? 'my_MM' : 'en_US',
    },
  }
}

export default async function PrivacyPage() {
  const [rawContent, locale] = await Promise.all([getHomepageContent(), getLocale()])
  const dict = getDictionary(locale)
  const content = localizeHomepageContent(rawContent, locale)

  return (
    <main className="dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-14 sm:px-12 sm:pt-10 sm:pb-16 md:px-16 lg:max-w-3xl">
        <Reveal>
          <h1
            className={`text-3xl leading-tight text-ink sm:text-4xl md:text-5xl dark:text-neutral-100 ${headingLeading(locale)} ${headingGap(locale)}`}
          >
            <span className="block">{dict.privacy.headingLine1}</span>
            <span className={`block font-display font-bold text-brand ${italicIfLatin(locale)}`}>{dict.privacy.headingLine2}</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base dark:text-neutral-400">{dict.privacy.intro}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <RichText
            value={dict.privacy.body}
            locale={locale}
            className="mt-2 text-sm leading-relaxed text-ink sm:text-base dark:text-neutral-200"
          />
        </Reveal>
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
