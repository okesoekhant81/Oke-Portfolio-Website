'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  addClassDateAction,
  deleteClassDateAction,
  updateClassDateStatusAction,
  updateClassDateFeeAction,
  updateClassDateCapacityAction,
  updateClassDateLabelAction,
  updateClassDateTimeAction,
} from '../../app/actions/classDates'

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const STATUS_STYLES = {
  upcoming: 'border-neutral-300 bg-neutral-100 text-neutral-600',
  'in-progress': 'border-brand/40 bg-brand/10 text-brand',
  completed: 'border-green-300 bg-green-50 text-green-700',
}

function StatusSelect({ id, status }) {
  const [current, setCurrent] = useState(status || 'upcoming')
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
        await updateClassDateStatusAction(formData)
      } catch {
        setCurrent(previous)
      }
    })
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className={`rounded-full border px-2 py-0.5 text-xs font-medium outline-none ${STATUS_STYLES[current] || STATUS_STYLES.upcoming}`}
    >
      <option value="upcoming">Upcoming</option>
      <option value="in-progress">In progress</option>
      <option value="completed">Completed</option>
    </select>
  )
}

// The number itself is never applied automatically anywhere — it only ever
// pre-fills a student's "amount paid" input as a starting suggestion (see
// StudentRow's PaymentEditor) once this is saved.
function FeeEditor({ id, defaultFee }) {
  const [value, setValue] = useState(String(defaultFee || 0))
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()
  const dirty = value !== String(defaultFee || 0)

  function handleSave() {
    setSaving(true)
    const formData = new FormData()
    formData.set('id', id)
    formData.set('defaultFee', value)
    startTransition(async () => {
      try {
        await updateClassDateFeeAction(formData)
      } finally {
        setSaving(false)
      }
    })
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="text-neutral-400">Default fee:</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 rounded-md border border-neutral-300 px-2 py-0.5 text-xs outline-none focus:border-brand"
      />
      <span className="text-neutral-400">MMK</span>
      {dirty && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="font-medium text-brand hover:underline disabled:opacity-60"
        >
          {saving ? '…' : 'Save'}
        </button>
      )}
    </span>
  )
}

// 0 means unlimited — the registration form only shows seats-left/waitlist
// once this is set above 0.
function CapacityEditor({ id, capacity }) {
  const [value, setValue] = useState(String(capacity || 0))
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()
  const dirty = value !== String(capacity || 0)

  function handleSave() {
    setSaving(true)
    const formData = new FormData()
    formData.set('id', id)
    formData.set('capacity', value)
    startTransition(async () => {
      try {
        await updateClassDateCapacityAction(formData)
      } finally {
        setSaving(false)
      }
    })
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="text-neutral-400">Capacity:</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-md border border-neutral-300 px-2 py-0.5 text-xs outline-none focus:border-brand"
      />
      <span className="text-neutral-400">(0 = unlimited)</span>
      {dirty && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="font-medium text-brand hover:underline disabled:opacity-60"
        >
          {saving ? '…' : 'Save'}
        </button>
      )}
    </span>
  )
}

// Free text (e.g. "2:00 PM – 5:00 PM") — only ever shown back on the
// registration-confirmed email (see lib/registrantEmail.js), not used for
// any scheduling logic itself.
function TimeEditor({ id, time }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(time || '')
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()

  function handleSave() {
    setSaving(true)
    const formData = new FormData()
    formData.set('id', id)
    formData.set('time', value)
    startTransition(async () => {
      try {
        await updateClassDateTimeAction(formData)
        setEditing(false)
      } finally {
        setSaving(false)
      }
    })
  }

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {time && <span className="text-neutral-400">· {time}</span>}
        <button type="button" onClick={() => setEditing(true)} className="text-xs text-neutral-400 hover:text-brand">
          {time ? 'Edit time' : 'Add time'}
        </button>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. 2:00 PM – 5:00 PM"
        autoFocus
        className="w-40 rounded-md border border-neutral-300 px-2 py-0.5 text-xs outline-none focus:border-brand"
      />
      <button type="button" onClick={handleSave} disabled={saving} className="font-medium text-brand hover:underline disabled:opacity-60">
        {saving ? '…' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(time || '')
          setEditing(false)
        }}
        disabled={saving}
        className="text-neutral-400 hover:text-ink"
      >
        Cancel
      </button>
    </span>
  )
}

function LabelEditor({ id, label }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label || '')
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()

  function handleSave() {
    setSaving(true)
    const formData = new FormData()
    formData.set('id', id)
    formData.set('label', value)
    startTransition(async () => {
      try {
        await updateClassDateLabelAction(formData)
        setEditing(false)
      } finally {
        setSaving(false)
      }
    })
  }

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {label && <span className="text-neutral-400">— {label}</span>}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-neutral-400 hover:text-brand"
        >
          {label ? 'Edit' : 'Add label'}
        </button>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Weekend batch"
        autoFocus
        className="w-40 rounded-md border border-neutral-300 px-2 py-0.5 text-xs outline-none focus:border-brand"
      />
      <button type="button" onClick={handleSave} disabled={saving} className="font-medium text-brand hover:underline disabled:opacity-60">
        {saving ? '…' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(label || '')
          setEditing(false)
        }}
        disabled={saving}
        className="text-neutral-400 hover:text-ink"
      >
        Cancel
      </button>
    </span>
  )
}

// Renders straight from the `dates`/`students` props rather than keeping a
// local copy — a successful add/delete/edit calls revalidatePath, which
// refreshes these props from the server automatically, so there's nothing
// to reconcile by hand. Only the delete-in-flight/error state is genuinely
// local.
export default function ClassesManager({ dates, students }) {
  const [state, formAction, pending] = useActionState(addClassDateAction, null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [, startTransition] = useTransition()

  function handleDelete(id) {
    setDeletingId(id)
    setDeleteError(null)
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await deleteClassDateAction(formData)
      } catch {
        setDeleteError(id)
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
      <p className="font-display text-base font-bold italic text-brand">Classes</p>
      <p className="mt-1 text-xs text-neutral-500">
        Also shown as a choice on the registration form — remove a class once it&rsquo;s passed or full. If this list
        is empty, the form just skips asking.
      </p>

      {dates.length > 0 && (
        <ul className="mt-4 space-y-2">
          {dates.map((d) => {
            const classStudents = students.filter((s) => s.classDate === d.date)
            const revenue = classStudents.reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0)
            return (
              <li
                key={d.id}
                className={`rounded-lg border border-neutral-100 px-3 py-3 ${deletingId === d.id ? 'opacity-40' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm">
                    <Link href={`/admin/classes/${d.id}`} className="font-medium text-ink hover:text-brand">
                      {formatDate(d.date)}
                    </Link>
                    <LabelEditor id={d.id} label={d.label} />
                    <TimeEditor id={d.id} time={d.time} />
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusSelect id={d.id} status={d.status} />
                    {deleteError === d.id && <span className="text-xs text-red-600">Couldn&rsquo;t delete</span>}
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      disabled={deletingId === d.id}
                      className="text-xs text-neutral-400 hover:text-red-600 disabled:hover:text-neutral-400"
                    >
                      {deletingId === d.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <Link href={`/admin/classes/${d.id}`} className="hover:text-brand">
                    {classStudents.length} student{classStudents.length === 1 ? '' : 's'}
                  </Link>
                  {d.capacity > 0 && (
                    <span className={classStudents.length >= d.capacity ? 'font-medium text-brand' : ''}>
                      {classStudents.length >= d.capacity
                        ? 'Full'
                        : `${d.capacity - classStudents.length} seat${d.capacity - classStudents.length === 1 ? '' : 's'} left`}
                    </span>
                  )}
                  <span>{revenue.toLocaleString()} MMK collected</span>
                  <FeeEditor id={d.id} defaultFee={d.defaultFee} />
                  <CapacityEditor id={d.id} capacity={d.capacity} />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form
        action={formAction}
        key={state?.savedAt || 0}
        className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4"
      >
        <div>
          <label className="block text-xs font-medium text-neutral-600">Date</label>
          <input
            type="date"
            name="date"
            required
            className="mt-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="block text-xs font-medium text-neutral-600">Label (optional)</label>
          <input
            name="label"
            placeholder="e.g. Weekend batch"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Time (optional)</label>
          <input
            name="time"
            placeholder="e.g. 2:00 PM – 5:00 PM"
            className="mt-1 w-40 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Default fee (MMK)</label>
          <input
            type="number"
            name="defaultFee"
            min="0"
            step="1"
            placeholder="e.g. 150000"
            className="mt-1 w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Capacity</label>
          <input
            type="number"
            name="capacity"
            min="0"
            step="1"
            placeholder="0 = unlimited"
            className="mt-1 w-28 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add class'}
        </button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  )
}
