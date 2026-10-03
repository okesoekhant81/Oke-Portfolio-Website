'use client'

import { motion } from 'framer-motion'
import Reveal from './Reveal'
import { getDictionary, headingGap, headingLeading, italicIfLatin } from '../lib/dictionaries'

export default function ThingsImBuilding({ line1, line2, intro, emphasis, projects, locale = 'en' }) {
  const dict = getDictionary(locale)

  return (
    <section id="work" className="bg-neutral-50 px-6 py-12 sm:px-12 sm:py-16 md:px-16 dark:bg-white/5">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className={`text-4xl text-ink sm:text-5xl md:text-6xl dark:text-neutral-100 ${headingLeading(locale)} ${headingGap(locale)}`}>
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

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {projects.map((project, i) => {
            const Wrapper = project.url ? motion.a : motion.div
            const linkProps = project.url ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' } : {}
            return (
              <Reveal key={project.name} delay={0.1 + i * 0.1}>
                <Wrapper
                  {...linkProps}
                  whileHover="hover"
                  initial="rest"
                  transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.6 }}
                  variants={{ rest: { y: 0 }, hover: { y: -8 } }}
                  className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-neutral-800 dark:bg-ink"
                >
                  <div className="flex h-12 items-center">
                    <motion.img
                      src={project.logo}
                      alt={`${project.name} logo`}
                      variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                      transition={{ type: 'spring', stiffness: 280, damping: 20, mass: 0.6 }}
                      className="h-auto max-h-12 w-auto origin-left object-contain"
                    />
                  </div>
                  <p className="mt-5 text-xs leading-relaxed text-ink dark:text-neutral-100 sm:text-sm">
                    {dict.home.projectPrefix}
                    <em className="font-display not-italic">{project.location}</em>
                    {dict.home.projectSuffix} {project.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                    <p
                      className={`font-display text-xs font-bold text-ink dark:text-neutral-100 ${italicIfLatin(locale)}`}
                    >
                      {project.role}
                    </p>
                    {project.url && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                        {dict.home.visitProject}
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 17L17 7M7 7h10v10" />
                        </svg>
                      </span>
                    )}
                  </div>
                </Wrapper>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
