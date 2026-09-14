import Image from 'next/image'
import Reveal from './Reveal'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

export default function Testimonials({ testimonials, locale = 'en' }) {
  if (!testimonials || testimonials.length === 0) return null
  const dict = getDictionary(locale)

  return (
    <section className="bg-white px-6 py-14 dark:bg-ink sm:px-12 sm:py-20 md:px-16">
      <Reveal className="mx-auto max-w-5xl">
        <h2 className={`font-display text-2xl font-bold text-ink sm:text-3xl dark:text-neutral-100 ${italicIfLatin(locale)}`}>
          {dict.testimonials.heading}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
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
