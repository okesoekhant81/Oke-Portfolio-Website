'use client'

import Reveal from './Reveal'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../lib/dictionaries'

export default function ClientWork({ clientWork, locale = 'en' }) {
  const dict = getDictionary(locale)

  if (!clientWork || clientWork.length === 0) return null

  return (
    <section className="bg-neutral-50 px-6 py-12 sm:px-12 sm:py-16 md:px-16 dark:bg-white/5">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2
            className={`text-4xl text-ink sm:text-5xl md:text-6xl dark:text-neutral-100 ${headingLeading(locale)} ${headingGap(locale)}`}
          >
            <span className="block">{dict.clientWork.line1}</span>
            <span className={`block font-display font-bold text-brand ${italicIfLatin(locale)}`}>
              {dict.clientWork.line2}
            </span>
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base dark:text-neutral-400">{dict.clientWork.intro}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {clientWork.map((entry, i) => (
            <Reveal key={entry.id} delay={0.1 + (i % 4) * 0.08}>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-ink">
                <p
                  className={`font-display text-base font-bold text-ink dark:text-neutral-100 ${italicIfLatin(locale)}`}
                >
                  {entry.name}
                </p>
                {entry.scope && <p className="mt-0.5 text-xs text-brand">{entry.scope}</p>}
                {entry.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted dark:text-neutral-400">{entry.description}</p>
                )}
                {entry.highlight && (
                  <p className="mt-3 text-xs font-semibold text-ink dark:text-neutral-100">{entry.highlight}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
