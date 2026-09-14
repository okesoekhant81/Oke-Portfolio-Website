'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { LOCALE_COOKIE, DEFAULT_LOCALE, LOCALES, getDictionary } from '../lib/dictionaries'
import { CONSENT_COOKIE, CONSENT_EVENT } from './GoogleAnalytics'

const EASE = [0.16, 1, 0.3, 1]

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Everything else this site sets (admin session, language preference,
// this notice's own choice) is essential — Google Analytics is the one
// actual optional cookie, so Accept/Decline is a real choice here, not
// just a "Got it": Decline genuinely stops it from loading
// (see GoogleAnalytics.jsx), rather than a button that changes nothing.
export default function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [locale, setLocale] = useState(DEFAULT_LOCALE)

  useEffect(() => {
    // Admin routes are the site owner's own workspace, not a visitor — a
    // cookie notice there is pointless, and admin pages never render this
    // component's dark-mode-aware public styling anyway.
    if (window.location.pathname.startsWith('/admin')) return
    const storedLocale = readCookie(LOCALE_COOKIE)
    setLocale(LOCALES.includes(storedLocale) ? storedLocale : DEFAULT_LOCALE)
    // Only 'accepted'/'declined' count as answered — an earlier visit's
    // dismissal of the previous single-button version of this banner
    // (stored as '1') predates there being an actual Accept/Decline
    // choice to make, so it doesn't count as one.
    setVisible(!['accepted', 'declined'].includes(readCookie(CONSENT_COOKIE)))
    setMounted(true)
  }, [])

  function choose(value) {
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`
    document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
    setVisible(false)
  }

  if (!mounted) return null
  const dict = getDictionary(locale)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-10 dark:border-neutral-800 dark:bg-ink/95"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted sm:text-sm dark:text-neutral-400">
              {dict.cookieConsent.message}{' '}
              <Link
                href="/privacy"
                className="text-brand underline decoration-brand/40 underline-offset-4 transition-colors duration-300 hover:text-ink dark:hover:text-white"
              >
                {dict.cookieConsent.learnMore}
              </Link>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => choose('declined')}
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs text-ink transition-colors duration-300 hover:border-brand hover:text-brand sm:text-sm dark:border-neutral-700 dark:text-neutral-100"
              >
                {dict.cookieConsent.decline}
              </button>
              <button
                type="button"
                onClick={() => choose('accepted')}
                className="rounded-full bg-brand px-5 py-2 text-xs font-medium text-white sm:text-sm"
              >
                {dict.cookieConsent.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
