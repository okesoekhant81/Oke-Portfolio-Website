'use client'

import { useState, useTransition } from 'react'
import {
  updateStudentClassAction,
  updateStudentPaymentAction,
  deleteStudentAction,
  addAttendanceAction,
  deleteAttendanceAction,
} from '../../app/actions/students'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const PAYMENT_STYLES = {
  unpaid: 'border-red-300 bg-red-50 text-red-700',
  partial: 'border-amber-300 bg-amber-50 text-amber-700',
  paid: 'border-green-300 bg-green-50 text-green-700',
}

// Same optimistic-update shape as InquiryStatusSelect: flip the badge
// immediately, write in the background, put it back if the write fails.
function ClassSelect({ student, classDates }) {
  const [current, setCurrent] = useState(student.classDate || '')
  const [, startTransition] = useTransition()

  function handleChange(e) {
    const previous = current
    const next = e.target.value
    setCurrent(next)
    const formData = new FormData()
    formData.set('id', student.id)
    formData.set('classDate', next)
    startTransition(async () => {
      try {
        await updateStudentClassAction(formData)
      } catch {
        setCurrent(previous)
      }
    })
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
    >
      <option value="">Unassigned</option>
      {classDates.map((d) => (
        <option key={d.id} value={d.date}>
          {formatDate(d.date)}
          {d.label ? ` — ${d.label}` : ''}
        </option>
      ))}
    </select>
  )
}

function PaymentEditor({ student }) {
  const [status, setStatus] = useState(student.paymentStatus || 'unpaid')
  const [amount, setAmount] = useState(String(student.amountPaid ?? 0))
  const [note, setNote] = useState(student.paymentNote || '')
  const [savingNote, setSavingNote] = useState(false)
  const [, startTransition] = useTransition()

  function save(nextStatus, nextAmount, nextNote) {
    const formData = new FormData()
    formData.set('id', student.id)
    formData.set('paymentStatus', nextStatus)
    formData.set('amountPaid', nextAmount)
    formData.set('paymentNote', nextNote)
    return updateStudentPaymentAction(formData)
  }

  function handleStatusChange(e) {
    const previous = status
    const next = e.target.value
    setStatus(next)
    startTransition(async () => {
      try {
        await save(next, amount, note)
      } catch {
        setStatus(previous)
      }
    })
  }

  function handleSaveDetails() {
    setSavingNote(true)
    startTransition(async () => {
      try {
        await save(status, amount, note)
      } catch {
        // Nothing destructive happened — the typed values just stay put so
        // the admin can hit Save again.
      } finally {
        setSavingNote(false)
      }
    })
  }

  const dirty = amount !== String(student.amountPaid ?? 0) || note !== (student.paymentNote || '')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={handleStatusChange}
        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium outline-none ${PAYMENT_STYLES[status] || PAYMENT_STYLES.unpaid}`}
      >
        <option value="unpaid">Unpaid</option>
        <option value="partial">Partial</option>
        <option value="paid">Paid</option>
      </select>
      <input
        type="number"
        min="0"
        step="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount paid"
        className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Payment note — method, date…"
        className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
      />
      {dirty && (
        <button
          type="button"
          onClick={handleSaveDetails}
          disabled={savingNote}
          className="shrink-0 text-xs font-medium text-brand hover:underline disabled:opacity-60"
        >
          {savingNote ? 'Saving…' : 'Save'}
        </button>
      )}
    </div>
  )
}

function AttendancePanel({ student }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState(null)
  const entries = student.attendance || []

  function handleAdd(e) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('studentId', student.id)
    startTransition(async () => {
      try {
        await addAttendanceAction(formData)
        form.reset()
      } catch {
        // Leave the form filled in — nothing was lost, they can retry.
      }
    })
  }

  function handleDelete(entryId) {
    setDeletingId(entryId)
    const formData = new FormData()
    formData.set('studentId', student.id)
    formData.set('entryId', entryId)
    startTransition(async () => {
      try {
        await deleteAttendanceAction(formData)
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div className="mt-3 border-t border-neutral-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-neutral-500 hover:text-ink"
      >
        Attendance ({entries.length}) {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {entries.length > 0 && (
            <ul className="space-y-1">
              {entries
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-2 text-xs">
                    <span>
                      <span className="font-medium text-ink">{formatDate(entry.date)}</span>{' '}
                      <span className={entry.present ? 'text-green-600' : 'text-red-600'}>
                        {entry.present ? 'Present' : 'Absent'}
                      </span>
                      {entry.note && <span className="text-neutral-400"> — {entry.note}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="shrink-0 text-neutral-400 hover:text-red-600 disabled:opacity-60"
                    >
                      {deletingId === entry.id ? '…' : 'Remove'}
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              name="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
            />
            <select
              name="present"
              defaultValue="true"
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
            >
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
            <input
              name="note"
              placeholder="Note (optional)"
              className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 rounded-md bg-brand px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? 'Adding…' : 'Add'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function StudentRow({ student, classDates }) {
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const [, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Remove ${student.name} from the roster? This can't be undone.`)) return
    setDeleting(true)
    setDeleteError(false)
    const formData = new FormData()
    formData.set('id', student.id)
    startTransition(async () => {
      try {
        await deleteStudentAction(formData)
      } catch {
        setDeleteError(true)
        setDeleting(false)
      }
    })
  }

  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-4 transition-opacity duration-300 ${
        deleting ? 'pointer-events-none opacity-40' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold text-ink">{student.name}</p>
          <p className="text-xs text-neutral-400">
            {[student.email, student.phone].filter(Boolean).join(' · ') || 'No contact info'}
          </p>
          {student.business && (
            <p className="text-xs text-neutral-400">
              {student.business}
              {student.role ? ` — ${student.role}` : ''}
            </p>
          )}
        </div>
        <ClassSelect student={student} classDates={classDates} />
      </div>

      <div className="mt-3">
        <PaymentEditor student={student} />
      </div>

      <AttendancePanel student={student} />

      <div className="mt-3 flex items-center justify-end gap-3 border-t border-neutral-100 pt-3">
        {deleteError && <span className="text-xs text-red-600">Couldn&rsquo;t remove — try again.</span>}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-neutral-400 hover:text-red-600 disabled:hover:text-neutral-400"
        >
          {deleting ? 'Removing…' : 'Remove'}
        </button>
      </div>
    </div>
  )
}
