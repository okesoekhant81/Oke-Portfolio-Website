'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Reveal from './Reveal'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

const RECENT_COUNT = 4

// Horizontal, snap-scrolling slider rather than a vertical grid — with
// more than a handful of testimonials, a grid just keeps growing the
// page's height. Only the most recently added few are shown (newest
// first), native scroll-snap handles touch/drag, and the prev/next
// buttons are there for mouse/keyboard users and don't need a carousel
// library.
export default function Testimonials({ testimonials, locale = 'en' }) {
  const scrollerRef = useRef(null)
  if (!testimonials || testimonials.length === 0) return null
  const dict = getDictionary(locale)
  const recent = testimonials.slice(-RECENT_COUNT).reverse()

  function scrollByCard(direction) {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-card]')
    const amount = card ? card.getBoundingClientRect().width + 20 : 300
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="bg-white px-6 py-14 dark:bg-ink sm:px-12 sm:py-20 md:px-16">
      <Reveal className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className={`font-display text-2xl font-bold text-ink sm:text-3xl dark:text-neutral-100 ${italicIfLatin(locale)}`}>
            {dict.testimonials.heading}
          </h2>
          {recent.length > 1 && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-ink transition-colors duration-300 hover:border-brand hover:text-brand dark:border-neutral-800 dark:text-neutral-100"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-ink transition-colors duration-300 hover:border-brand hover:text-brand dark:border-neutral-800 dark:text-neutral-100"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollerRef}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {recent.map((t) => (
            <div
              key={t.id}
              data-card
              className="w-[85%] shrink-0 snap-start rounded-xl border border-neutral-200 p-5 dark:border-neutral-800 sm:w-[46%] lg:w-[31%]"
            >
              <p className={`font-display text-sm leading-relaxed text-ink dark:text-neutral-100 ${italicIfLatin(locale)}`}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                {t.photo ? (
                  <Image
                    src={t.photo}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">{t.name}</p>
                  {t.role && <p className="truncate text-xs text-muted dark:text-neutral-400">{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
