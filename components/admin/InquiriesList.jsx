'use client'

import { useState, useTransition } from 'react'
import InquiryStatusSelect from './InquiryStatusSelect'
import { deleteInquiryAction } from '../../app/actions/inquiries'

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] tracking-wide text-neutral-400 uppercase">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
    </div>
  )
}

function formatClassDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const HEAR_ABOUT_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  referral: 'Friend or colleague',
  search: 'Google search',
  other: 'Other',
}

// Deleting used to be a plain form submit that waited on the full round
// trip to Blob and the page refresh before anything visibly changed — with
// no pending state in between, it was impossible to tell whether the click
// had registered at all. Now the card dims and the button label flips to
// "Deleting…" the instant it's clicked, so that's never in question, and
// the row only disappears once the delete has actually gone through.
export default function InquiriesList({ inquiries }) {
  const [items, setItems] = useState(inquiries)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [, startTransition] = useTransition()

  function handleDelete(inquiry) {
    if (!confirm(`Delete the inquiry from "${inquiry.name}"? This can't be undone.`)) return
    setDeletingId(inquiry.id)
    setDeleteError(null)
    const formData = new FormData()
    formData.set('id', inquiry.id)
    startTransition(async () => {
      try {
        await deleteInquiryAction(formData)
        setItems((prev) => prev.filter((item) => item.id !== inquiry.id))
      } catch {
        setDeleteError(inquiry.id)
      } finally {
        setDeletingId(null)
      }
    })
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 text-sm text-neutral-500">
        No inquiries yet — this fills in as people register on the workshop page.
      </p>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {items.map((inquiry) => {
        const isDeleting = deletingId === inquiry.id
        return (
          <div
            key={inquiry.id}
            className={`rounded-xl border border-neutral-200 bg-white p-5 transition-opacity duration-300 ${
              isDeleting ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-ink">{inquiry.name}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(inquiry.submittedAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DetailRow label="Email" value={inquiry.email} />
              <DetailRow label="Phone" value={inquiry.phone} />
              <DetailRow label="Class date" value={inquiry.classDate ? formatClassDate(inquiry.classDate) : null} />
              <DetailRow label="Business" value={inquiry.business} />
              <DetailRow label="Role" value={inquiry.role} />
              <DetailRow label="Participants" value={inquiry.participants} />
              <DetailRow label="Heard via" value={HEAR_ABOUT_LABELS[inquiry.hearAbout] || inquiry.hearAbout} />
            </div>

            {inquiry.message && (
              <div className="mt-3 border-t border-neutral-100 pt-3">
                <p className="text-[10px] tracking-wide text-neutral-400 uppercase">Message</p>
                <p className="mt-0.5 text-sm whitespace-pre-line text-ink">{inquiry.message}</p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-3 border-t border-neutral-100 pt-3">
              {deleteError === inquiry.id && (
                <span className="text-xs text-red-600">Couldn&rsquo;t delete — try again.</span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(inquiry)}
                disabled={isDeleting}
                className="text-sm text-neutral-400 hover:text-red-600 disabled:hover:text-neutral-400"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
