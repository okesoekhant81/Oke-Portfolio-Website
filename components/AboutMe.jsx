'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Reveal from './Reveal'
import RichText from './RichText'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../lib/dictionaries'

export default function AboutMe({ line1, line2, body, locale = 'en' }) {
  const dict = getDictionary(locale)

  return (
    <section id="about" className="bg-brand px-6 py-12 text-white sm:px-12 sm:py-16 md:px-16">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className={`text-4xl leading-tight sm:text-5xl md:text-6xl ${headingLeading(locale)} ${headingGap(locale)}`}>
          <span className="block">{line1}</span>
          <span className={`block font-display font-bold ${italicIfLatin(locale)}`}>{line2}</span>
        </h2>

        <RichText value={body} locale={locale} className="text-sm font-light leading-relaxed sm:text-base" />

        <Link href="/about" className="mt-6 inline-block">
          <motion.span
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
            className="inline-block cursor-pointer rounded-full bg-white px-5 py-2 text-xs font-medium text-brand"
          >
            {dict.home.aboutCta}
          </motion.span>
        </Link>
      </Reveal>
    </section>
  )
}
