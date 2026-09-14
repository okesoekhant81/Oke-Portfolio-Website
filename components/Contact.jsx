import Link from 'next/link'
import Reveal from './Reveal'
import RichText from './RichText'
import SocialIcons from './SocialIcons'
import NewsletterForm from './NewsletterForm'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../lib/dictionaries'

export default function Contact({ line1, line2, body, cta, email, copyright, tagline, locale = 'en' }) {
  const dict = getDictionary(locale)
  return (
    <footer id="contact" className="bg-white px-6 py-14 text-ink sm:px-12 sm:py-16 md:px-16 dark:bg-ink dark:text-neutral-100">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className={`text-3xl leading-tight sm:text-4xl md:text-5xl ${headingLeading(locale)} ${headingGap(locale)}`}>
          <span className="block">{line1}</span>
          <span className={`block font-display font-bold ${italicIfLatin(locale)}`}>{line2}</span>
        </h2>

        <RichText value={body} locale={locale} className="text-sm leading-relaxed text-muted sm:text-base dark:text-neutral-400" />

        <p className="mt-6 text-sm sm:text-base">{cta}</p>
        <a
          href={`mailto:${email}`}
          className="mt-1 inline-block text-sm text-brand underline decoration-brand/40 underline-offset-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-ink hover:decoration-ink/50 hover:underline-offset-[6px] sm:text-base dark:hover:text-white dark:hover:decoration-white/50"
        >
          {email}
        </a>

        <SocialIcons className="mt-8" />

        <NewsletterForm locale={locale} />

        <p className="mt-6 text-xs text-muted dark:text-neutral-400">{copyright}</p>
        <p className={`mt-1 font-display text-xs font-bold text-muted dark:text-neutral-400 ${italicIfLatin(locale)}`}>{tagline}</p>
        <Link
          href="/privacy"
          className="mt-3 inline-block text-xs text-muted underline decoration-muted/40 underline-offset-4 transition-colors duration-300 hover:text-brand dark:text-neutral-400 dark:hover:text-white"
        >
          {dict.privacy.metaTitle}
        </Link>
      </Reveal>
    </footer>
  )
}
