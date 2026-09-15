'use client'

import { useState } from 'react'

const btnClass =
  'inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-ink transition-colors duration-300 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-100'

// A direct Facebook share link, not just the generic Web Share API/copy
// fallback ShareButton.jsx already covers elsewhere — the person this is
// for explicitly wants a one-click way to post their certificate to
// Facebook, and navigator.share isn't available on desktop browsers at
// all, which is exactly where "sharing to Facebook" usually happens from.
export default function CertificateShare({ url, title }) {
  const [copied, setCopied] = useState(false)

  function shareToFacebook() {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  async function shareGeneric() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled the share sheet — not an error.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (permissions, insecure context) — nothing more to do.
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button type="button" onClick={shareToFacebook} className={btnClass} aria-label="Share to Facebook">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.25-1.5 1.53-1.5H16.5V4.35C16.2 4.31 15.2 4.22 14 4.22c-2.4 0-4 1.47-4 4.16V10.5H7.5v3H10V21h3.5z" />
        </svg>
        Share to Facebook
      </button>
      <button type="button" onClick={shareGeneric} className={btnClass}>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="2.4" />
          <circle cx="6" cy="12" r="2.4" />
          <circle cx="18" cy="19" r="2.4" />
          <path d="M8.1 10.6l7.4-4.3M8.1 13.4l7.4 4.3" />
        </svg>
        {copied ? 'Link copied' : 'Share'}
      </button>
    </div>
  )
}
