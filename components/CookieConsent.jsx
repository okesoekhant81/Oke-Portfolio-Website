'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { LOCALE_COOKIE, DEFAULT_LOCALE, LOCALES, getDictionary } from '../lib/dictionaries'

const CONSENT_COOKIE = 'cookie_consent'
const EASE = [0.16, 1, 0.3, 1]

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Every cookie this site sets is essential (admin session, language
// preference, this notice's own dismissal) — none of them are analytics,
// advertising, or third-party tracking. So this is a one-button notice
// rather than an Accept/Reject choice: there's nothing optional to opt out
// of, and offering a "Reject" that doesn't actually change any behavior
// would be misleading rather than helpful.
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
    setVisible(!readCookie(CONSENT_COOKIE))
    setMounted(true)
  }, [])

  function dismiss() {
    document.cookie = `${CONSENT_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}`
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
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-full bg-brand px-5 py-2 text-xs font-medium text-white sm:text-sm"
            >
              {dict.cookieConsent.accept}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
