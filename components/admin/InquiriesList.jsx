'use client'

import { useEffect, useState, useTransition } from 'react'
import InquiryStatusSelect from './InquiryStatusSelect'
import { useSearchFilter, SearchBar, FilterSelect } from './SearchFilterBar'
import { toCsv, downloadCsv } from '../../lib/csv'
import {
  deleteInquiryAction,
  bulkDeleteInquiriesAction,
  bulkSetInquiryStatusAction,
} from '../../app/actions/inquiries'
import { convertInquiryToStudentAction } from '../../app/actions/students'
import { useConfirm } from './ConfirmProvider'

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

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'enrolled', label: 'Enrolled' },
]

function exportInquiries(inquiries) {
  const csv = toCsv(inquiries, [
    { label: 'Name', value: (i) => i.name },
    { label: 'Email', value: (i) => i.email },
    { label: 'Phone', value: (i) => i.phone },
    { label: 'Business', value: (i) => i.business },
    { label: 'Role', value: (i) => i.role },
    { label: 'Class date', value: (i) => i.classDate },
    { label: 'Participants', value: (i) => i.participants },
    { label: 'Heard via', value: (i) => HEAR_ABOUT_LABELS[i.hearAbout] || i.hearAbout },
    { label: 'Waitlisted', value: (i) => (i.waitlisted ? 'Yes' : '') },
    { label: 'Status', value: (i) => i.status },
    { label: 'Submitted at', value: (i) => i.submittedAt },
    { label: 'Message', value: (i) => i.message },
  ])
  downloadCsv(`inquiries-${new Date().toISOString().slice(0, 10)}.csv`, csv)
}

// Deleting used to be a plain form submit that waited on the full round
// trip to Blob and the page refresh before anything visibly changed — with
// no pending state in between, it was impossible to tell whether the click
// had registered at all. Now the card dims and the button label flips to
// "Deleting…" the instant it's clicked, so that's never in question, and
// the row only disappears once the delete has actually gone through.
export default function InquiriesList({ inquiries }) {
  const [items, setItems] = useState(inquiries)
  // `items` only ever starts from `inquiries` on mount — a re-render with a
  // new `inquiries` prop (AutoRefresh's poll, or another admin's edit
  // landing via revalidatePath) wouldn't otherwise reach this local copy at
  // all, since useState's initializer doesn't re-run on updates. This is
  // what actually makes a poll visible.
  useEffect(() => {
    setItems(inquiries)
  }, [inquiries])
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [convertingId, setConvertingId] = useState(null)
  const [convertError, setConvertError] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [bulkPending, startBulkTransition] = useTransition()
  const [, startTransition] = useTransition()
  const confirm = useConfirm()

  // 'id' lets the admin paste the Registration ID a registrant quotes back
  // (from their success screen or the payment-confirmed email) straight
  // into search — case-insensitive matching in useSearchFilter means it
  // doesn't matter that it's stored lowercase but shown to registrants
  // uppercase.
  const { query, setQuery, activeFilters, setFilter, filtered } = useSearchFilter(items, {
    searchKeys: ['name', 'email', 'phone', 'business', 'id'],
  })

  async function handleDelete(inquiry) {
    if (!(await confirm(`Delete the inquiry from "${inquiry.name}"? This can't be undone.`))) return
    setDeletingId(inquiry.id)
    setDeleteError(null)
    const formData = new FormData()
    formData.set('id', inquiry.id)
    startTransition(async () => {
      try {
        await deleteInquiryAction(formData)
        setItems((prev) => prev.filter((item) => item.id !== inquiry.id))
        setSelected((prev) => {
          const next = new Set(prev)
          next.delete(inquiry.id)
          return next
        })
      } catch {
        setDeleteError(inquiry.id)
      } finally {
        setDeletingId(null)
      }
    })
  }

  function handleConvert(inquiry) {
    setConvertingId(inquiry.id)
    setConvertError(null)
    const formData = new FormData()
    formData.set('inquiryId', inquiry.id)
    startTransition(async () => {
      try {
        const result = await convertInquiryToStudentAction(formData)
        if (result?.error) {
          setConvertError(inquiry.id)
        } else if (result?.studentId) {
          setItems((prev) => prev.map((item) => (item.id === inquiry.id ? { ...item, studentId: result.studentId } : item)))
        }
      } catch {
        setConvertError(inquiry.id)
      } finally {
        setConvertingId(null)
      }
    })
  }

  function toggleSelected(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllVisible() {
    setSelected((prev) => {
      const visibleIds = filtered.map((i) => i.id)
      const allSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.has(id))
      return allSelected ? new Set() : new Set(visibleIds)
    })
  }

  async function handleBulkDelete() {
    if (!(await confirm(`Delete ${selected.size} inquir${selected.size === 1 ? 'y' : 'ies'}? This can't be undone.`))) return
    const ids = [...selected]
    const formData = new FormData()
    ids.forEach((id) => formData.append('id', id))
    startBulkTransition(async () => {
      await bulkDeleteInquiriesAction(formData)
      setItems((prev) => prev.filter((item) => !selected.has(item.id)))
      setSelected(new Set())
    })
  }

  function handleBulkStatus(status) {
    if (!status) return
    const ids = [...selected]
    const formData = new FormData()
    ids.forEach((id) => formData.append('id', id))
    formData.set('status', status)
    startBulkTransition(async () => {
      await bulkSetInquiryStatusAction(formData)
      setItems((prev) => prev.map((item) => (selected.has(item.id) ? { ...item, status } : item)))
      setSelected(new Set())
    })
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 text-sm text-neutral-500">
        No inquiries yet — this fills in as people register on the workshop page.
      </p>
    )
  }

  const visibleIds = filtered.map((i) => i.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search name, email, phone…" />
        <FilterSelect
          value={activeFilters.status}
          onChange={(v) => setFilter('status', v)}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
        />
        <button
          type="button"
          onClick={() => exportInquiries(filtered)}
          className="ml-auto rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-brand hover:text-brand"
        >
          Export CSV
        </button>
      </div>

      {filtered.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5 text-neutral-500">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
            Select all ({filtered.length})
          </label>
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5">
              <span className="text-xs text-neutral-500">{selected.size} selected</span>
              <FilterSelect
                value=""
                onChange={handleBulkStatus}
                options={STATUS_OPTIONS}
                placeholder="Set status…"
              />
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkPending}
                className="text-xs font-medium text-neutral-400 hover:text-red-600 disabled:opacity-60"
              >
                {bulkPending ? 'Working…' : 'Delete selected'}
              </button>
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No inquiries match your search.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {filtered.map((inquiry) => {
            const isDeleting = deletingId === inquiry.id
            return (
              <div
                key={inquiry.id}
                className={`rounded-xl border border-neutral-200 bg-white p-5 transition-opacity duration-300 ${
                  isDeleting ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(inquiry.id)}
                      onChange={() => toggleSelected(inquiry.id)}
                      className="mt-1.5"
                    />
                    <div>
                      <p className="flex items-center gap-2 font-display text-base font-bold text-ink">
                        {inquiry.name}
                        {inquiry.waitlisted && (
                          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            Waitlist
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(inquiry.submittedAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                        {' · '}
                        <span className="font-mono">{inquiry.id?.toUpperCase()}</span>
                      </p>
                    </div>
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
                  {inquiry.paymentProofUrl && (
                    <div>
                      <p className="text-[10px] tracking-wide text-neutral-400 uppercase">Payment proof</p>
                      <a
                        href={inquiry.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 block text-sm text-brand hover:underline"
                      >
                        View screenshot ↗
                      </a>
                    </div>
                  )}
                </div>

                {inquiry.message && (
                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <p className="text-[10px] tracking-wide text-neutral-400 uppercase">Message</p>
                    <p className="mt-0.5 text-sm whitespace-pre-line text-ink">{inquiry.message}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-3 border-t border-neutral-100 pt-3">
                  {convertError === inquiry.id && (
                    <span className="text-xs text-red-600">Couldn&rsquo;t convert — try again.</span>
                  )}
                  {inquiry.studentId ? (
                    <a href="/admin/students" className="text-xs font-medium text-green-700 hover:underline">
                      ✓ On roster
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConvert(inquiry)}
                      disabled={convertingId === inquiry.id}
                      className="text-xs font-medium text-brand hover:underline disabled:opacity-60"
                    >
                      {convertingId === inquiry.id ? 'Converting…' : 'Convert to student'}
                    </button>
                  )}
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
      )}
    </div>
  )
}
