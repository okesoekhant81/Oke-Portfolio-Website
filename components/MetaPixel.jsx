'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { CONSENT_COOKIE, CONSENT_EVENT } from './GoogleAnalytics'
import { META_PIXEL_ID } from '../lib/site'

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Same consent-gated, admin-excluded loading as GoogleAnalytics.jsx —
// this is the same "optional" cookie the banner already asks about, not a
// second consent surface, so it reuses that component's cookie/event names
// rather than introducing a new choice for the visitor to make.
export default function MetaPixel() {
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

  // Client-side navigation doesn't re-run the inline init script below, so
  // without this only the very first page of a visit would ever get a
  // PageView — same reasoning as GoogleAnalytics.jsx's matching effect.
  useEffect(() => {
    if (!enabled || typeof window.fbq !== 'function') return
    window.fbq('track', 'PageView')
  }, [enabled, pathname])

  if (!enabled) return null

  return (
    <Script id="meta-pixel-init" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  )
}
