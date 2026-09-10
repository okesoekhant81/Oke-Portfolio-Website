'use client'

import { motion } from 'framer-motion'
import dubaiLogo from '../assets/img/dubai-directory-logo.png'
import thailandLogo from '../assets/img/thailand-directory-logo.png'
import Reveal from './Reveal'

const projects = [
  {
    logo: dubaiLogo,
    name: 'Dubai Directory',
    location: 'Myanmar community in Dubai',
    role: 'Founder / Brand / Product / Growth',
  },
  {
    logo: thailandLogo,
    name: 'Thailand Directory',
    location: 'Myanmar community in Thailand',
    role: 'Founder / Brand / Product / Growth',
  },
]

export default function ThingsImBuilding() {
  return (
    <section className="bg-white px-6 py-12 sm:px-12 sm:py-16 md:px-16">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="text-4xl text-ink sm:text-5xl md:text-6xl">
            <span className="block">Thing</span>
            <span className="block font-display font-bold italic text-brand">I&rsquo;m Building</span>
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            I don&rsquo;t only work on brands.{' '}
            <span className="font-display font-bold italic text-ink">I like building things too.</span>
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8">
          {projects.map((project, i) => (
            <Reveal key={project.name} delay={0.1 + i * 0.1}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <img
                  src={project.logo.src}
                  alt={`${project.name} logo`}
                  className="h-auto w-32 object-contain sm:w-44"
                />
                <p className="mt-4 text-xs leading-relaxed text-ink">
                  A digital discovery platform built for the{' '}
                  <em className="font-display not-italic">{project.location}</em>. Bringing useful
                  businesses, services, information, and local discoveries into one community-driven
                  ecosystem.
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
