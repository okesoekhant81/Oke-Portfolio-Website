'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Polls the server at a fixed interval via router.refresh() — the pages
// that render this are `dynamic = 'force-dynamic'`, so each refresh re-runs
// that page's own data fetch (getInquiries/getStudents/...) server-side and
// passes fresh props down. Without this, a new registration submitted by a
// visitor never appears for an admin already sitting on the page; they'd
// only see it after manually reloading.
//
// Skips while the tab is hidden/backgrounded rather than polling
// unconditionally — an admin with this tab open in the background all day
// shouldn't be generating a request (and a Postgres query) every interval
// for a page nobody's looking at.
export default function AutoRefresh({ intervalMs = 20000 }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
