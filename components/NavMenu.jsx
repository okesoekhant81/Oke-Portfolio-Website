'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/#work', label: 'Work' },
  { href: '/#about', label: 'About' },
  { href: '/blog', label: 'Articles' },
  { href: '/#contact', label: 'Contact' },
]

const EASE = [0.16, 1, 0.3, 1]

export default function NavMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="fixed right-5 top-5 z-50 flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white sm:right-8 sm:top-8"
      >
        <motion.span
          animate={open ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="h-[1.5px] w-5 bg-ink"
        />
        <motion.span
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="h-[1.5px] w-5 bg-ink"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="h-[1.5px] w-5 bg-ink"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-40 flex items-center bg-ink"
          >
            <nav className="mx-auto w-full max-w-3xl px-6 sm:px-12 md:px-16">
              <ul className="space-y-4 sm:space-y-6">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="font-display text-4xl font-bold italic text-white transition-colors duration-300 hover:text-brand sm:text-5xl"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
