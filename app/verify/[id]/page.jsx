import NavMenu from '../../../components/NavMenu'
import PrintableCertificate from '../../../components/admin/PrintableCertificate'
import CertificateShare from '../../../components/CertificateShare'
import { getStudent } from '../../../lib/content/students'
import { getClassDates } from '../../../lib/content/classDates'
import { getWorkshopContent } from '../../../lib/content/workshop'
import { getLocale } from '../../../lib/i18n'
import { localizeWorkshopContent } from '../../../lib/localizeContent'
import { generateVerifyQrDataUrl } from '../../../lib/certificateQr'
import { SITE_NAME, SITE_URL } from '../../../lib/site'

export const dynamic = 'force-dynamic'

// Not meant to be discovered or crawled — each URL is only useful to
// whoever already holds that one Registration ID (a student proving their
// own certificate to someone else), not something search engines or a
// public listing should surface. Open Graph tags still matter despite
// that: noindex only keeps search engines from listing this page, it
// doesn't stop Facebook's own scraper from reading these when the share
// button below sends someone here, and without them the share preview is
// just the site's generic homepage card.
export async function generateMetadata({ params }) {
  const { id: rawId } = await params
  const id = rawId.toLowerCase()
  const [student, classDates] = await Promise.all([getStudent(id), getClassDates()])
  const assignedClass = classDates.find((d) => d.date === student?.classDate)
  const verified = Boolean(student && student.paymentStatus === 'paid' && assignedClass?.status === 'completed')

  if (!verified) {
    return { title: 'Verify a certificate', robots: { index: false, follow: false } }
  }

  const title = `${student.name} — Certificate Verified`
  const description = `${student.name} completed ${assignedClass?.label || SITE_NAME} at ${SITE_NAME}.`
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title, description, url: `${SITE_URL}/verify/${student.id}` },
  }
}

export default async function VerifyCertificatePage({ params }) {
  const { id: rawId } = await params
  // Registration IDs are always shown to registrants uppercase (see
  // state.registrationId in RegistrationForm.jsx and the certificate's own
  // verify link below) but stored lowercase — this is the one place a
  // human actually retypes/pastes one by hand, so it's normalized here
  // rather than trusting the case it arrives in.
  const id = rawId.toLowerCase()

  const [student, classDates, rawWorkshop, locale] = await Promise.all([
    getStudent(id),
    getClassDates(),
    getWorkshopContent(),
    getLocale(),
  ])
  const workshop = localizeWorkshopContent(rawWorkshop, locale)

  const assignedClass = classDates.find((d) => d.date === student?.classDate)
  // Both conditions matter, not just "class completed" — a student whose
  // class ran to completion but who never actually paid isn't someone this
  // site issued a real certificate to; StudentRow only ever shows the
  // Certificate link once both are true, so this mirrors that same rule
  // rather than trusting the class status alone.
  const verified = Boolean(student && student.paymentStatus === 'paid' && assignedClass?.status === 'completed')
  const courseName = assignedClass?.label || `${workshop.heroTitle} ${workshop.heroSubtitle}`
  // The site's current course outline, not a snapshot of what existed when
  // this particular student took it — same "courseName" reasoning as
  // above: nothing here is versioned per-class, so "what the certificate
  // represents" is always read as of today.
  const outlineModules = (workshop.modules || []).filter((m) => m.title)
  const verifyUrl = verified ? `${SITE_URL}/verify/${student.id}` : null
  const qrCodeUrl = verifyUrl ? await generateVerifyQrDataUrl(verifyUrl) : null

  return (
    <main className="min-h-screen dark:bg-ink">
      <NavMenu locale={locale} />
      <div className={`mx-auto px-6 py-16 text-center sm:px-12 ${verified ? 'max-w-2xl' : 'max-w-md'}`}>
        {verified ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 font-display text-lg font-bold text-ink dark:text-neutral-100">Certificate verified</p>

            <div className="mt-6">
              <PrintableCertificate
                studentName={student.name}
                courseName={courseName}
                classDate={student.classDate}
                issuerName={SITE_NAME}
                logoUrl={workshop.certificateLogo}
                signatureUrl={workshop.certificateSignature}
                qrCodeUrl={qrCodeUrl}
              />
            </div>

            <CertificateShare url={verifyUrl} title={`${student.name} completed ${courseName} — ${SITE_NAME}`} />

            {outlineModules.length > 0 && (
              <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 text-left dark:border-neutral-800 dark:bg-white/5">
                <p className="text-xs font-semibold text-neutral-500">Course outline completed</p>
                <ul className="mt-3 space-y-2">
                  {outlineModules.map((module, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink dark:text-neutral-100">
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{module.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-neutral-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </div>
            <p className="mt-4 font-display text-lg font-bold text-ink dark:text-neutral-100">
              We couldn&rsquo;t verify a certificate for this ID
            </p>
            <p className="mt-2 text-sm text-muted dark:text-neutral-400">
              Double-check the Registration ID, or contact {SITE_NAME} if you believe this is a mistake.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
