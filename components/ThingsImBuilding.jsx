'use client'

import { motion } from 'framer-motion'
import Reveal from './Reveal'

export default function ThingsImBuilding({ line1, line2, intro, emphasis, projects }) {
  return (
    <section className="bg-white px-6 py-12 sm:px-12 sm:py-16 md:px-16">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="text-4xl text-ink sm:text-5xl md:text-6xl">
            <span className="block">{line1}</span>
            <span className="block font-display font-bold italic text-brand">{line2}</span>
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            {intro} <span className="font-display font-bold italic text-ink">{emphasis}</span>
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8">
          {projects.map((project, i) => (
            <Reveal key={project.name} delay={0.1 + i * 0.1}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <img
                  src={project.logo}
                  alt={`${project.name} logo`}
                  className="h-auto w-32 object-contain sm:w-44"
                />
                <p className="mt-4 text-xs leading-relaxed text-ink">
                  A digital discovery platform built for the <em className="font-display not-italic">{project.location}</em>.{' '}
                  {project.description}
                </p>
                <p className="mt-3 font-display text-xs font-bold italic text-ink">{project.role}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
