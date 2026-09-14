import { headingLeading, italicIfLatin } from '../lib/dictionaries'

// Same plain <details>/<summary> accordion as WorkshopOutline — no client
// JS needed, accessible by default. `faqs` is expected already
// locale-resolved (see localizeWorkshopContent); blank questions are
// skipped rather than shown empty.
export default function FAQAccordion({ heading, faqs, locale = 'en' }) {
  const visible = (faqs || []).filter((faq) => faq.question)
  if (visible.length === 0) return null

  return (
    <div className="mt-12">
      <h2
        className={`font-display text-xl font-bold text-brand sm:text-2xl ${italicIfLatin(locale)} ${headingLeading(locale)}`}
      >
        {heading}
      </h2>
      <div className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
        {visible.map((faq, i) => (
          <details key={i} className="group py-4">
            <summary
              className={`flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm font-bold text-ink [&::-webkit-details-marker]:hidden dark:text-neutral-100 sm:text-base ${headingLeading(locale)}`}
            >
              {faq.question}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 dark:text-neutral-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            {faq.answer && (
              <p className="mt-3 text-sm leading-relaxed text-muted dark:text-neutral-400">{faq.answer}</p>
            )}
          </details>
        ))}
      </div>
    </div>
  )
}
