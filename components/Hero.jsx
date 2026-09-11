'use client'

import { motion } from 'framer-motion'
import Reveal from './Reveal'
import RichText from './RichText'
import { headingLeading, italicIfLatin } from '../lib/dictionaries'

export default function Hero({ name, body, badgePrefix, badgeEmphasis, image, locale = 'en' }) {
  return (
    <section className="bg-white pt-6 sm:pt-8 md:pt-10 dark:bg-ink">
      <div className="mx-auto flex max-w-5xl flex-col sm:flex-row sm:items-center sm:gap-10 sm:px-10 md:gap-16 md:px-16">
        <Reveal className="px-6 pb-8 sm:flex-1 sm:px-0 sm:pb-14">
          <h1 className={`text-3xl text-ink sm:text-5xl md:text-6xl dark:text-neutral-100 ${headingLeading(locale)}`}>
            I&rsquo;m{' '}
            <span className="font-display font-bold italic text-brand">{name}</span>
          </h1>

          <RichText
            value={body}
            locale={locale}
            className="text-sm leading-relaxed text-muted sm:text-base dark:text-neutral-400"
          />

          <div className="mt-5">
            <motion.span
              whileHover={{ scale: 1.06, boxShadow: '0 10px 25px -8px rgba(232,54,6,0.55)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
              className="inline-block cursor-default rounded-full bg-brand px-5 py-2 text-xs font-light text-white"
            >
              {badgePrefix} <span className={`font-display font-bold text-white ${italicIfLatin(locale)}`}>{badgeEmphasis}</span>
            </motion.span>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto sm:mx-0 sm:shrink-0">
          <motion.img
            src={image}
            alt={`Portrait of ${name}`}
            whileHover={{ scale: 1.04, rotate: -0.5 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.7 }}
            className="h-auto w-56 sm:w-44 md:w-52 lg:w-60"
          />
        </Reveal>
      </div>
    </section>
  )
}
