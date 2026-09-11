'use client'

import { motion } from 'framer-motion'
import Reveal from './Reveal'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

export default function ThingsImBuilding({ line1, line2, intro, emphasis, projects, locale = 'en' }) {
  const dict = getDictionary(locale)

  return (
    <section id="work" className="bg-white px-6 py-12 sm:px-12 sm:py-16 md:px-16 dark:bg-ink">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="text-4xl text-ink sm:text-5xl md:text-6xl dark:text-neutral-100">
            <span className="block">{line1}</span>
            <span className={`block font-display font-bold text-brand ${italicIfLatin(locale)}`}>{line2}</span>
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base dark:text-neutral-400">
            {intro}{' '}
            <span className={`font-display font-bold text-ink dark:text-neutral-100 ${italicIfLatin(locale)}`}>
              {emphasis}
            </span>
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8">
          {projects.map((project, i) => (
            <Reveal key={project.name} delay={0.1 + i * 0.1}>
              <motion.div
                whileHover="hover"
                initial="rest"
                transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.6 }}
                variants={{ rest: { y: 0 }, hover: { y: -6 } }}
              >
                <motion.img
                  src={project.logo}
                  alt={`${project.name} logo`}
                  variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20, mass: 0.6 }}
                  className="h-auto w-32 origin-left object-contain sm:w-44"
                />
                <p className="mt-4 text-xs leading-relaxed text-ink dark:text-neutral-100">
                  {dict.home.projectPrefix}
                  <em className="font-display not-italic">{project.location}</em>
                  {dict.home.projectSuffix} {project.description}
                </p>
                <p className={`mt-3 font-display text-xs font-bold text-ink dark:text-neutral-100 ${italicIfLatin(locale)}`}>
                  {project.role}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
