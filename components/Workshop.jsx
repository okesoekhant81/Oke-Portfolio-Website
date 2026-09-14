'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Reveal from './Reveal'
import RichText from './RichText'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../lib/dictionaries'

export default function Workshop({ image, line1, line2, body, role, locale = 'en' }) {
  const dict = getDictionary(locale)

  return (
    <section className="relative overflow-hidden bg-ink">
      <Image src={image} alt={`${line1} ${line2}`} fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <Reveal className="relative mx-auto max-w-3xl px-6 py-14 text-white sm:px-12 sm:py-20 md:px-16">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl ${headingLeading(locale)} ${headingGap(locale)}`}>
          <span className={`block font-display font-bold ${italicIfLatin(locale)}`}>{line1}</span>
          <span className="block">{line2}</span>
        </h2>
        <RichText value={body} locale={locale} className="text-sm font-light leading-relaxed sm:text-base" />
        <p className={`mt-4 font-display text-sm font-bold sm:text-base ${italicIfLatin(locale)}`}>{role}</p>

        <Link href="/workshop" className="mt-6 inline-block">
          <motion.span
            whileHover={{ scale: 1.06, boxShadow: '0 10px 25px -8px rgba(232,54,6,0.55)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
            className="inline-block cursor-pointer rounded-full bg-brand px-5 py-2 text-xs font-light text-white"
          >
            {dict.workshop.viewDetails}
          </motion.span>
        </Link>
      </Reveal>
    </section>
  )
}
