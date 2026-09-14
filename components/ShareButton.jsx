'use client'

import { useState } from 'react'
import { getDictionary } from '../lib/dictionaries'

export default function ShareButton({ url, title, locale = 'en' }) {
  const dict = getDictionary(locale)
  const [copied, setCopied] = useState(false)

  async function share() {
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
    <button
      type="button"
      onClick={share}
      aria-label={dict.blog.shareAria}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-ink transition-colors duration-300 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-100"
    >
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
      {copied ? dict.blog.linkCopied : dict.blog.share}
    </button>
  )
}
