import Reveal from './Reveal'
import RichText from './RichText'
import { headingLeading, italicIfLatin } from '../lib/dictionaries'

export default function AboutMe({ line1, line2, body, locale = 'en' }) {
  return (
    <section id="about" className="bg-brand px-6 py-12 text-white sm:px-12 sm:py-16 md:px-16">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className={`text-4xl leading-tight sm:text-5xl md:text-6xl ${headingLeading(locale)}`}>
          <span className="block">{line1}</span>
          <span className={`block font-display font-bold ${italicIfLatin(locale)}`}>{line2}</span>
        </h2>

        <RichText value={body} locale={locale} className="text-sm font-light leading-relaxed sm:text-base" />
      </Reveal>
    </section>
  )
}
