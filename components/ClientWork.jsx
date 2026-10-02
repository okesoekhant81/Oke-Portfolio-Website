'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../lib/dictionaries'

const AUTO_ADVANCE_MS = 5000

export default function ClientWork({ clientWork, locale = 'en' }) {
  const dict = getDictionary(locale)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const count = clientWork?.length || 0

  const goTo = useCallback((next) => setIndex(((next % count) + count) % count), [count])

  // Pauses on hover/focus so reading a longer description doesn't get cut
  // off mid-way by the next slide — resumes the moment the pointer/focus
  // leaves, rather than stopping for good.
  useEffect(() => {
    if (paused || count <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [paused, count])

  if (!clientWork || count === 0) return null

  const entry = clientWork[index]

  return (
    <section className="bg-neutral-50 px-6 py-12 sm:px-12 sm:py-16 md:px-16 dark:bg-white/5">
      <div className="mx-auto max-w-2xl">
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

        <div
          className="relative mt-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-ink">
            <AnimatePresence mode="wait">
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 sm:p-8"
              >
                {entry.logo && (
                  <img src={entry.logo} alt={`${entry.name} logo`} className="h-9 w-auto max-w-[160px] object-contain" />
                )}
                <p
                  className={`font-display text-lg font-bold text-ink dark:text-neutral-100 sm:text-xl ${italicIfLatin(locale)} ${entry.logo ? 'mt-4' : ''}`}
                >
                  {entry.name}
                </p>
                {entry.scope && <p className="mt-0.5 text-xs text-brand sm:text-sm">{entry.scope}</p>}
                {entry.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base dark:text-neutral-400">
                    {entry.description}
                  </p>
                )}
                {entry.highlight && (
                  <p className="mt-4 text-sm font-semibold text-ink dark:text-neutral-100">{entry.highlight}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous"
                className="absolute top-1/2 -left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-ink shadow-sm transition-colors hover:border-brand hover:text-brand sm:-left-4 dark:border-neutral-700 dark:bg-ink dark:text-neutral-100"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next"
                className="absolute top-1/2 -right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-ink shadow-sm transition-colors hover:border-brand hover:text-brand sm:-right-4 dark:border-neutral-700 dark:bg-ink dark:text-neutral-100"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <div className="mt-5 flex justify-center gap-2">
                {clientWork.map((w, i) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to ${w.name}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? 'w-6 bg-brand' : 'w-1.5 bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
