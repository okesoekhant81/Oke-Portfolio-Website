'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import RichText from './RichText'
import { italicIfLatin } from '../lib/dictionaries'

const EASE = [0.16, 1, 0.3, 1]
const DISMISSED_KEY = 'workshop_promo_dismissed'
const SHOW_DELAY = 1500

// Once per browser session (sessionStorage, not a cookie) — a visitor who
// closes it or clicks through shouldn't see it again on every page within
// the same visit, but it's fair game again on their next visit.
export default function WorkshopPromoPopup({ enabled, heading, body, cta, locale = 'en' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled || !heading) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY)
    return () => clearTimeout(timer)
  }, [enabled, heading])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-neutral-800 dark:bg-ink"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 text-neutral-400 transition-colors duration-300 hover:text-ink dark:hover:text-white"
            >
              ✕
            </button>
            <h2 className={`font-display text-xl font-bold text-ink sm:text-2xl ${italicIfLatin(locale)} dark:text-white`}>
              {heading}
            </h2>
            <RichText value={body} locale={locale} className="text-sm leading-relaxed text-muted [&>p]:mt-2 dark:text-neutral-400" />
            <Link href="/workshop" onClick={dismiss} className="mt-5 inline-block">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
                className="inline-block cursor-pointer rounded-full bg-brand px-5 py-2 text-xs font-medium text-white sm:text-sm"
              >
                {cta}
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
