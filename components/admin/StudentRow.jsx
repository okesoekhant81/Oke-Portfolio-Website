'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  updateStudentProfileAction,
  updateStudentClassAction,
  updateStudentPaymentAction,
  deleteStudentAction,
  addAttendanceAction,
  deleteAttendanceAction,
} from '../../app/actions/students'
import { useConfirm } from './ConfirmProvider'

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

function PaymentEditor({ student, suggestedFee }) {
  const [status, setStatus] = useState(student.paymentStatus || 'unpaid')
  // No amount recorded yet — start the input at the class's usual rate
  // (e.g. its early-bird price) instead of 0, since that's what almost
  // every student actually pays; still just a starting value; it isn't
  // saved as "paid" until the admin picks a status and hits Save.
  const [amount, setAmount] = useState(String(student.amountPaid || suggestedFee || 0))
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

// Renders from local state, not straight from the `student.attendance`
// prop — adding or removing an entry updates this list immediately
// (optimistic) instead of waiting on the full save + revalidation round
// trip, which is what made this feel slow. Failures roll the optimistic
// change back and show a real error instead of the previous behavior,
// which silently dropped the entry with no sign anything had gone wrong —
// that mattered once taking attendance for a whole class one student at a
// time meant a burst of these landing on the same file close together,
// occasionally exhausting mutateJson's conflict retries.
function AttendancePanel({ student }) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState(student.attendance || [])
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState(null)
  const [addError, setAddError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const date = formData.get('date')?.toString()
    if (!date) return
    const present = formData.get('present')?.toString() === 'true'
    const note = formData.get('note')?.toString().trim() || ''
    formData.set('studentId', student.id)
    setAddError(null)

    const previous = entries
    // Same upsert-by-date behavior as the server: replace any existing
    // entry for this date rather than adding a second one for it.
    setEntries((prev) => {
      const idx = prev.findIndex((en) => en.date === date)
      const optimistic = { id: idx >= 0 ? prev[idx].id : `pending-${Date.now()}`, date, present, note }
      return idx >= 0 ? prev.map((en, i) => (i === idx ? optimistic : en)) : [...prev, optimistic]
    })
    form.reset()

    startTransition(async () => {
      try {
        await addAttendanceAction(formData)
      } catch {
        setEntries(previous)
        setAddError(date)
      }
    })
  }

  function handleDelete(entryId) {
    setDeletingId(entryId)
    setDeleteError(null)
    const previous = entries
    setEntries((prev) => prev.filter((en) => en.id !== entryId))
    const formData = new FormData()
    formData.set('studentId', student.id)
    formData.set('entryId', entryId)
    startTransition(async () => {
      try {
        await deleteAttendanceAction(formData)
      } catch {
        setEntries(previous)
        setDeleteError(entryId)
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
                      {deleteError === entry.id && <span className="ml-1 text-red-600">Couldn&rsquo;t remove</span>}
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
              Add
            </button>
          </form>
          {addError && <p className="text-xs text-red-600">Couldn&rsquo;t save {formatDate(addError)} — try again.</p>}
        </div>
      )}
    </div>
  )
}

const fieldClass =
  'rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand'

// Name/email/phone/business/role were only ever set once, at creation —
// there was no way back into them, so a typo when adding a student (or
// converting one from an inquiry that already had one) was permanent
// short of deleting the student and losing their payment/attendance
// history. View mode is the default (matches the same "view first,
// explicit Edit to change" instinct as the homepage/workshop content
// forms), not continuous inline editing.
function ProfileEditor({ student }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(student.name || '')
  const [email, setEmail] = useState(student.email || '')
  const [phone, setPhone] = useState(student.phone || '')
  const [business, setBusiness] = useState(student.business || '')
  const [role, setRole] = useState(student.role || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [, startTransition] = useTransition()

  function startEdit() {
    setName(student.name || '')
    setEmail(student.email || '')
    setPhone(student.phone || '')
    setBusiness(student.business || '')
    setRole(student.role || '')
    setError(null)
    setEditing(true)
  }

  function handleSave() {
    if (!name.trim()) {
      setError('Please enter a name.')
      return
    }
    setSaving(true)
    setError(null)
    const formData = new FormData()
    formData.set('id', student.id)
    formData.set('name', name)
    formData.set('email', email)
    formData.set('phone', phone)
    formData.set('business', business)
    formData.set('role', role)
    startTransition(async () => {
      try {
        const result = await updateStudentProfileAction(formData)
        if (result?.error) setError(result.error)
        else setEditing(false)
      } catch {
        setError('Could not save. Please try again.')
      } finally {
        setSaving(false)
      }
    })
  }

  if (!editing) {
    return (
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-base font-bold text-ink">{student.name}</p>
          <button type="button" onClick={startEdit} className="text-xs text-neutral-400 hover:text-brand">
            Edit
          </button>
        </div>
        <p className="text-xs text-neutral-400">
          {[student.email, student.phone].filter(Boolean).join(' · ') || 'No contact info'}
        </p>
        <p className="text-xs text-neutral-400">
          Registration ID: <span className="font-mono">{(student.sourceInquiryId || student.id)?.toUpperCase()}</span>
        </p>
        {student.business && (
          <p className="text-xs text-neutral-400">
            {student.business}
            {student.role ? ` — ${student.role}` : ''}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={`w-full font-medium ${fieldClass}`} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={fieldClass} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={fieldClass} />
        <input
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          placeholder="Business (optional)"
          className={fieldClass}
        />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (optional)" className={fieldClass} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-brand px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="text-xs text-neutral-500 hover:text-ink"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  )
}

export default function StudentRow({ student, classDates }) {
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const [, startTransition] = useTransition()
  const confirm = useConfirm()
  const assignedClass = classDates.find((d) => d.date === student.classDate)

  async function handleDelete() {
    if (!(await confirm(`Remove ${student.name} from the roster? This can't be undone.`))) return
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
        <ProfileEditor student={student} />
        <ClassSelect student={student} classDates={classDates} />
      </div>

      <div className="mt-3">
        <PaymentEditor student={student} suggestedFee={assignedClass?.defaultFee} />
      </div>

      <AttendancePanel student={student} />

      <div className="mt-3 flex items-center justify-end gap-3 border-t border-neutral-100 pt-3">
        {assignedClass?.status === 'completed' && (
          <Link href={`/admin/certificate/${student.id}`} className="text-xs text-brand hover:underline">
            Certificate
          </Link>
        )}
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
