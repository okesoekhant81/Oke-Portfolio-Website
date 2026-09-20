'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDictionary } from '../lib/dictionaries'

// Registration IDs are shown to registrants uppercase (see
// RegistrationForm.jsx / the certificate's own verify link) but the actual
// lookup at /verify/[id] normalizes case itself — this just needs to strip
// stray whitespace from a copy-pasted ID before navigating.
export default function CertificateLookupForm({ locale = 'en' }) {
  const dict = getDictionary(locale)
  const router = useRouter()
  const [id, setId] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = id.trim()
    if (!trimmed) {
      setError(true)
      return
    }
    setError(false)
    setSubmitting(true)
    router.push(`/verify/${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label htmlFor="cert-lookup-id" className="text-xs font-semibold text-muted dark:text-neutral-400">
        {dict.certLookup.inputLabel}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="cert-lookup-id"
          type="text"
          value={id}
          onChange={(e) => {
            setId(e.target.value)
            if (error) setError(false)
          }}
          placeholder={dict.certLookup.placeholder}
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {submitting ? dict.certLookup.submitting : dict.certLookup.submit}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{dict.certLookup.error}</p>}
    </form>
  )
}
