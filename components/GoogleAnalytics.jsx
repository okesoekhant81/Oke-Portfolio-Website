'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '../lib/site'

const CONSENT_COOKIE = 'cookie_consent'
const CONSENT_EVENT = 'cookie-consent-changed'

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Loads gtag.js only once the visitor has actually accepted — CookieConsent
// dispatches CONSENT_EVENT the moment they choose, and readCookie() picks
// up an earlier visit's choice on mount, so this never has to poll. Never
// on /admin: that's the site owner's own traffic, not a visitor's, and
// counting it would skew every number this exists to produce.
export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return
    setEnabled(readCookie(CONSENT_COOKIE) === 'accepted')

    function handleConsentChange(e) {
      setEnabled(e.detail === 'accepted')
    }
    document.addEventListener(CONSENT_EVENT, handleConsentChange)
    return () => document.removeEventListener(CONSENT_EVENT, handleConsentChange)
  }, [])

  // Client-side navigation between pages (Link, router.push) doesn't
  // reload gtag.js or re-run its inline config call, which only ever sees
  // whatever page was current the moment it first loaded — without this,
  // every page after the first one in a visit would go uncounted.
  useEffect(() => {
    if (!enabled || typeof window.gtag !== 'function') return
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: pathname })
  }, [enabled, pathname])

  if (!enabled) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  )
}

export { CONSENT_COOKIE, CONSENT_EVENT }
