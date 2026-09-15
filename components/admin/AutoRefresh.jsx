'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Polls a cheap "did anything change" check (checkAction — a row count plus
// the latest timestamp, see getInquiriesFingerprint/getStudentsFingerprint)
// rather than blindly refetching this page's full data on a timer.
// router.refresh() — the actually expensive step, since it re-runs the
// page's own getInquiries()/getStudents() and re-renders everything below
// it — only fires when that check's result differs from the last poll, so
// a quiet page does nothing but a cheap count query every few seconds.
//
// Skips entirely while the tab is hidden/backgrounded, same reasoning as
// before: nobody's watching, so there's nothing to keep live.
export default function AutoRefresh({ checkAction, intervalMs = 5000 }) {
  const router = useRouter()
  const lastFingerprint = useRef(null)
  const hasBaseline = useRef(false)

  useEffect(() => {
    if (!checkAction) return

    async function poll() {
      if (document.visibilityState !== 'visible') return

      let fingerprint
      try {
        fingerprint = await checkAction()
      } catch {
        return
      }
      if (!fingerprint) return

      const key = `${fingerprint.count}:${fingerprint.latest}`
      // The first successful check just establishes what "current" already
      // looks like — nothing to compare against yet, and definitely not
      // something to refresh over.
      if (!hasBaseline.current) {
        lastFingerprint.current = key
        hasBaseline.current = true
        return
      }
      if (key !== lastFingerprint.current) {
        lastFingerprint.current = key
        router.refresh()
      }
    }

    const id = setInterval(poll, intervalMs)
    return () => clearInterval(id)
  }, [checkAction, intervalMs, router])

  return null
}
