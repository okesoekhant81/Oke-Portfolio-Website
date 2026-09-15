import NavMenu from '../../../components/NavMenu'
import { getStudent } from '../../../lib/content/students'
import { getClassDates } from '../../../lib/content/classDates'
import { getWorkshopContent } from '../../../lib/content/workshop'
import { getLocale } from '../../../lib/i18n'
import { SITE_NAME } from '../../../lib/site'

export const dynamic = 'force-dynamic'

// Not meant to be discovered or crawled — each URL is only useful to
// whoever already holds that one Registration ID (a student proving their
// own certificate to someone else), not something search engines or a
// public listing should surface.
export const metadata = {
  title: 'Verify a certificate',
  robots: { index: false, follow: false },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function VerifyCertificatePage({ params }) {
  const { id: rawId } = await params
  // Registration IDs are always shown to registrants uppercase (see
  // state.registrationId in RegistrationForm.jsx and the certificate's own
  // verify link below) but stored lowercase — this is the one place a
  // human actually retypes/pastes one by hand, so it's normalized here
  // rather than trusting the case it arrives in.
  const id = rawId.toLowerCase()

  const [student, classDates, workshop, locale] = await Promise.all([
    getStudent(id),
    getClassDates(),
    getWorkshopContent(),
    getLocale(),
  ])

  const assignedClass = classDates.find((d) => d.date === student?.classDate)
  // Both conditions matter, not just "class completed" — a student whose
  // class ran to completion but who never actually paid isn't someone this
  // site issued a real certificate to; StudentRow only ever shows the
  // Certificate link once both are true, so this mirrors that same rule
  // rather than trusting the class status alone.
  const verified = Boolean(student && student.paymentStatus === 'paid' && assignedClass?.status === 'completed')
  const courseName = assignedClass?.label || `${workshop.heroTitle} ${workshop.heroSubtitle}`

  return (
    <main className="min-h-screen dark:bg-ink">
      <NavMenu locale={locale} />
      <div className="mx-auto max-w-md px-6 py-16 text-center sm:px-12">
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
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 text-left dark:border-neutral-800 dark:bg-white/5">
              <p className="text-xs text-muted dark:text-neutral-400">Name</p>
              <p className="text-sm font-semibold text-ink dark:text-neutral-100">{student.name}</p>
              <p className="mt-3 text-xs text-muted dark:text-neutral-400">Course</p>
              <p className="text-sm font-semibold text-ink dark:text-neutral-100">{courseName}</p>
              {student.classDate && (
                <>
                  <p className="mt-3 text-xs text-muted dark:text-neutral-400">Completed</p>
                  <p className="text-sm font-semibold text-ink dark:text-neutral-100">{formatDate(student.classDate)}</p>
                </>
              )}
              <p className="mt-3 text-xs text-muted dark:text-neutral-400">Issued by</p>
              <p className="text-sm font-semibold text-ink dark:text-neutral-100">{SITE_NAME}</p>
            </div>
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
