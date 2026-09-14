'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]

// Content forms open read-only, need an explicit Edit to unlock, and
// relock themselves the moment a save succeeds — before this, everything
// was editable the instant the page loaded, and the only sign a save had
// actually gone through was a small line of green text easy to miss
// entirely, which read as "did that just silently fail?" This makes both
// states — nothing changed yet vs. just saved — impossible to miss.
export default function SaveBar({ locked, onEdit, onCancel, pending, state, editLabel = 'Edit', saveLabel = 'Save changes' }) {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!state?.success) return
    setShowSuccess(true)
    const timer = setTimeout(() => setShowSuccess(false), 4000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.savedAt])

  return (
    <div className="sticky bottom-4 z-10 mt-8">
      <AnimatePresence mode="wait" initial={false}>
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 p-4 shadow-lg"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.span>
            <span className="text-sm font-semibold text-green-800">Saved — live on the site now.</span>
          </motion.div>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
          >
            {locked ? (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {editLabel}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                >
                  {pending ? 'Saving…' : saveLabel}
                </button>
                <button type="button" onClick={onCancel} disabled={pending} className="text-sm text-neutral-500 hover:text-ink">
                  Cancel
                </button>
              </>
            )}
            {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
