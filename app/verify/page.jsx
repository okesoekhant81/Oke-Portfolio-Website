import NavMenu from '../../components/NavMenu'
import CertificateLookupForm from '../../components/CertificateLookupForm'
import { getLocale } from '../../lib/i18n'
import { getDictionary, italicIfLatin } from '../../lib/dictionaries'
import { SITE_URL, SITE_NAME } from '../../lib/site'

export async function generateMetadata() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  return {
    title: dict.certLookup.heading,
    description: dict.certLookup.body,
    alternates: { canonical: '/verify' },
    openGraph: {
      url: `${SITE_URL}/verify`,
      title: `${dict.certLookup.heading} — ${SITE_NAME}`,
      description: dict.certLookup.body,
      locale: locale === 'my' ? 'my_MM' : 'en_US',
    },
  }
}

// The public entry point for a former student who has a Registration ID
// but not the direct /verify/[id] link (e.g. the certificate-ready email
// got buried or deleted) — looks the ID up and hands off to that page,
// which does the actual verification.
export default async function VerifyLookupPage() {
  const locale = await getLocale()
  const dict = getDictionary(locale)

  return (
    <main className="min-h-screen dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-md px-6 py-16 sm:px-12">
        <h1
          className={`font-display text-2xl font-bold text-ink sm:text-3xl dark:text-neutral-100 ${italicIfLatin(locale)}`}
        >
          {dict.certLookup.heading}
        </h1>
        <p className="mt-2 text-sm text-muted dark:text-neutral-400">{dict.certLookup.body}</p>
        <CertificateLookupForm locale={locale} />
      </div>
    </main>
  )
}
