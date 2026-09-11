import Reveal from './Reveal'
import RichText from './RichText'
import { italicIfLatin } from '../lib/dictionaries'

export default function Workshop({ image, line1, line2, body, role, locale = 'en' }) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <img src={image} alt={`${line1} ${line2}`} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <Reveal className="relative mx-auto max-w-3xl px-6 py-14 text-white sm:px-12 sm:py-20 md:px-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl">
          <span className={`block font-display font-bold ${italicIfLatin(locale)}`}>{line1}</span>
          <span className="block">{line2}</span>
        </h2>
        <RichText value={body} locale={locale} className="text-sm font-light leading-relaxed sm:text-base" />
        <p className={`mt-4 font-display text-sm font-bold sm:text-base ${italicIfLatin(locale)}`}>{role}</p>
      </Reveal>
    </section>
  )
}
