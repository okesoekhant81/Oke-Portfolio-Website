'use client'

import { useActionState, useRef, useState } from 'react'
import Image from 'next/image'
import Reveal from './Reveal'
import StarRating from './StarRating'
import { submitTestimonialAction } from '../app/actions/testimonials'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

const RECENT_COUNT = 4

function SubmitForm({ locale, onDone }) {
  const dict = getDictionary(locale)
  const [state, formAction, pending] = useActionState(submitTestimonialAction, null)
  const [rating, setRating] = useState(5)
  const honeypotRef = useRef(null)
  const [startedAt] = useState(() => Date.now())
  const inputClass =
    'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors duration-300 focus:border-brand dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100'

  if (state?.success) {
    return <p className="mt-4 text-sm text-brand">{dict.testimonials.formSuccess}</p>
  }

  return (
    <form action={formAction} className="mt-4 max-w-md space-y-3">
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="testimonial-website">Website</label>
        <input ref={honeypotRef} id="testimonial-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="formStartedAt" value={startedAt} />
      <input type="hidden" name="rating" value={rating} />

      <StarRating value={rating} onChange={setRating} size={20} />
      <input name="name" required placeholder={dict.testimonials.formName} className={inputClass} />
      <input name="role" placeholder={dict.testimonials.formRole} className={inputClass} />
      <textarea name="quote" required rows={3} placeholder={dict.testimonials.formQuote} className={inputClass} />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:text-sm"
        >
          {pending ? dict.testimonials.formSubmitting : dict.testimonials.formSubmit}
        </button>
        <button type="button" onClick={onDone} className="text-xs text-muted hover:text-ink dark:text-neutral-400 dark:hover:text-white">
          {dict.testimonials.formCancel}
        </button>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  )
}

// Horizontal, snap-scrolling slider rather than a vertical grid — with
// more than a handful of testimonials, a grid just keeps growing the
// page's height. Only the most recently added few are shown (newest
// first), native scroll-snap handles touch/drag, and the prev/next
// buttons are there for mouse/keyboard users and don't need a carousel
// library. Only 'approved' testimonials ever render here — a public
// submission starts 'pending' and stays invisible until an admin
// approves it (see submitTestimonialAction / TestimonialsManager).
export default function Testimonials({ testimonials, locale = 'en' }) {
  const scrollerRef = useRef(null)
  const [showForm, setShowForm] = useState(false)
  const dict = getDictionary(locale)
  const approved = (testimonials || []).filter((t) => t.status !== 'pending')
  const recent = approved.slice(-RECENT_COUNT).reverse()

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

        {recent.length > 0 && (
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
                <StarRating value={t.rating ?? 5} />
                <p className={`mt-2 font-display text-sm leading-relaxed text-ink dark:text-neutral-100 ${italicIfLatin(locale)}`}>
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
        )}

        {showForm ? (
          <SubmitForm locale={locale} onDone={() => setShowForm(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-6 text-sm text-brand underline decoration-brand/40 underline-offset-4 transition-colors duration-300 hover:text-ink dark:hover:text-white"
          >
            {dict.testimonials.shareCta}
          </button>
        )}
      </Reveal>
    </section>
  )
}
