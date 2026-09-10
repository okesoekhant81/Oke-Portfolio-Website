'use client'

import { motion } from 'framer-motion'
import heroOke from '../assets/img/hero-oke.png'
import Reveal from './Reveal'

export default function Hero() {
  return (
    <section className="bg-white pt-10 sm:pt-14 md:pt-16">
      <div className="mx-auto flex max-w-5xl flex-col sm:flex-row sm:items-center sm:gap-10 sm:px-10 md:gap-16 md:px-16">
        <Reveal className="px-6 pb-8 sm:flex-1 sm:px-0 sm:pb-14">
          <h1 className="text-3xl text-ink sm:text-5xl md:text-6xl">
            I&rsquo;m{' '}
            <span className="font-display font-bold italic text-brand">Oke</span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            work at the <em className="font-display not-italic font-medium text-ink">intersection</em> of
            brand, content, digital experiences, and business growth. I help turn{' '}
            <em className="font-display not-italic font-medium text-ink">ideas</em> into{' '}
            <em className="font-display not-italic font-medium text-ink">brands</em>, brands into
            systems, and systems into businesses that can grow.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            I turn standard businesses into powerful brands. By aligning brand strategy with advanced
            digital marketing, custom website/app development, and automated digital solutions, I build
            the system for your market expansion.
          </p>

          <div className="mt-5">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="inline-block cursor-default rounded-full bg-brand px-5 py-2 text-xs font-light text-white"
            >
              It&rsquo;s <span className="font-display font-bold italic">Heart Work!</span>
            </motion.span>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto sm:mx-0 sm:shrink-0">
          <motion.img
            src={heroOke.src}
            alt="Oke Soe Khant"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="h-auto w-56 sm:w-44 md:w-52 lg:w-60"
          />
        </Reveal>
      </div>
    </section>
  )
}
