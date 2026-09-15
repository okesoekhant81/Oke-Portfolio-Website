'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ConfirmContext = createContext(null)

// Replaces the browser's native confirm() for every destructive admin
// action — that's an unstyled OS-level dialog that can't be branded and
// (per feedback) reads as more alarming than a routine delete warrants.
// One instance mounted at the admin layout root (see app/admin/layout.jsx);
// any nested client component calls useConfirm() to get an async
// confirm(message) function with the same "await it, check the boolean"
// shape window.confirm had, so call sites only needed `if (!confirm(x))`
// to become `if (!(await confirm(x)))` inside an async handler.
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const resolveRef = useRef(null)

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setRequest({ message, ...options })
    })
  }, [])

  function respond(result) {
    resolveRef.current?.(result)
    resolveRef.current = null
    setRequest(null)
  }

  // Esc cancels, matching what a native confirm()/any OS dialog already did.
  useEffect(() => {
    if (!request) return
    function handleKey(e) {
      if (e.key === 'Escape') respond(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [request])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => respond(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-lg"
          >
            <p className="text-sm text-ink">{request.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => respond(false)}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-ink transition-colors duration-150 hover:border-brand hover:text-brand"
              >
                {request.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => respond(true)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {request.confirmLabel || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used within ConfirmProvider')
  return confirm
}
