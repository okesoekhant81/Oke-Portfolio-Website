import { headingLeading } from '../lib/dictionaries'

// Plain <details>/<summary> accordion — no client JS needed for something
// this simple, and it's accessible (keyboard, screen reader) by default.
// `modules` is expected already locale-resolved (see localizeWorkshopContent).
export default function WorkshopOutline({ modules, locale = 'en' }) {
  return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {modules.map((module, i) => {
        const lessons = (module.lessons || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)

        if (!module.title) return null

        return (
          <details key={i} className="group py-4" open={i === 0}>
            <summary
              className={`flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-ink [&::-webkit-details-marker]:hidden dark:text-neutral-100 sm:text-lg ${headingLeading(locale)}`}
            >
              {module.title}
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
            {lessons.length > 0 && (
              <ul className="mt-3 space-y-2">
                {lessons.map((lesson, j) => (
                  <li key={j} className="flex gap-2 text-sm leading-relaxed text-muted dark:text-neutral-400">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            )}
          </details>
        )
      })}
    </div>
  )
}
