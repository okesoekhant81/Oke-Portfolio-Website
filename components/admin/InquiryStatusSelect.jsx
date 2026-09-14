'use client'

import { useState, useTransition } from 'react'
import { updateInquiryStatusAction } from '../../app/actions/inquiries'

const STATUS_STYLES = {
  new: 'border-brand/40 bg-brand/10 text-brand',
  contacted: 'border-neutral-300 bg-neutral-100 text-neutral-600',
  enrolled: 'border-green-300 bg-green-50 text-green-700',
}

// Updates the badge immediately (local state) instead of waiting on the
// round trip to Blob and back — was previously a form that auto-submitted
// on change and waited for the page to refresh before the dropdown's own
// color updated, which read as the whole thing hanging for a couple of
// seconds. The write still happens, just in the background.
export default function InquiryStatusSelect({ id, status }) {
  const [current, setCurrent] = useState(status)
  const [, startTransition] = useTransition()

  function handleChange(e) {
    const previous = current
    const next = e.target.value
    setCurrent(next)
    const formData = new FormData()
    formData.set('id', id)
    formData.set('status', next)
    startTransition(async () => {
      try {
        await updateInquiryStatusAction(formData)
      } catch {
        // Couldn't save — put the badge back rather than showing a status
        // that isn't actually persisted.
        setCurrent(previous)
      }
    })
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className={`rounded-full border px-3 py-1 text-xs font-medium outline-none ${STATUS_STYLES[current] || STATUS_STYLES.new}`}
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="enrolled">Enrolled</option>
    </select>
  )
}
