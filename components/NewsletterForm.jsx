'use client'

import { useActionState, useRef, useState } from 'react'
import { subscribeNewsletterAction } from '../app/actions/newsletter'
import { getDictionary } from '../lib/dictionaries'

export default function NewsletterForm({ locale = 'en' }) {
  const dict = getDictionary(locale)
  const [state, formAction, pending] = useActionState(subscribeNewsletterAction, null)
  const honeypotRef = useRef(null)
  const [startedAt] = useState(() => Date.now())

  return (
    <form action={formAction} className="mt-6 max-w-sm">
      {/* Honeypot — see RegistrationForm.jsx for why this exists. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="newsletter-website">Website</label>
        <input ref={honeypotRef} id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="formStartedAt" value={startedAt} />

      {state?.success ? (
        <p className="text-sm text-brand">{dict.newsletter.success}</p>
      ) : (
        <>
          <label htmlFor="newsletter-email" className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-neutral-400">
            {dict.newsletter.heading}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder={dict.newsletter.placeholder}
              className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-transparent px-4 py-2 text-sm text-ink outline-none transition-colors duration-300 focus:border-brand dark:border-neutral-700 dark:text-neutral-100"
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:text-sm"
            >
              {pending ? '…' : dict.newsletter.button}
            </button>
          </div>
          {state?.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
        </>
      )}
    </form>
  )
}
