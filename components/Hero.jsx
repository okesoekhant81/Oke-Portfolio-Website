'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Reveal from './Reveal'
import RichText from './RichText'
import { getDictionary, headingLeading, italicIfLatin } from '../lib/dictionaries'

const MotionImage = motion.create(Image)

export default function Hero({ name, body, image, locale = 'en' }) {
  const dict = getDictionary(locale)

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
            <motion.a
              href="/oke-soe-khant-cv.pdf"
              download
              whileHover={{ scale: 1.06, boxShadow: '0 10px 25px -8px rgba(232,54,6,0.55)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-light text-white"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v13" />
                <path d="M6 11l6 6 6-6" />
                <path d="M4 21h16" />
              </svg>
              <span className={`font-display font-bold text-white ${italicIfLatin(locale)}`}>{dict.home.downloadCv}</span>
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto sm:mx-0 sm:shrink-0">
          <MotionImage
            src={image}
            alt={`Portrait of ${name}`}
            width={480}
            height={856}
            priority
            whileHover={{ scale: 1.04, rotate: -0.5 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.7 }}
            className="h-auto w-56 sm:w-44 md:w-52 lg:w-60"
          />
        </Reveal>
      </div>
    </section>
  )
}
