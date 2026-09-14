'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import { addClassDateAction, deleteClassDateAction, updateClassDateStatusAction } from '../../app/actions/classDates'

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

// Renders straight from the `dates` prop rather than keeping a local copy —
// a successful add or delete calls revalidatePath, which refreshes this
// prop from the server automatically, so there's nothing to reconcile by
// hand. Only the delete-in-flight/error state below is genuinely local.
export default function ClassDatesManager({ dates }) {
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
    <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
      <p className="font-display text-base font-bold italic text-brand">Upcoming class dates</p>
      <p className="mt-1 text-xs text-neutral-500">
        Shown as a choice on the registration form — remove a date once it&rsquo;s passed or full. If this list is
        empty, the form just skips asking.
      </p>

      {dates.length > 0 && (
        <ul className="mt-4 space-y-2">
          {dates.map((d) => (
            <li
              key={d.id}
              className={`flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2 text-sm ${
                deletingId === d.id ? 'opacity-40' : ''
              }`}
            >
              <span>
                <Link href={`/admin/classes/${d.id}`} className="font-medium text-ink hover:text-brand">
                  {formatDate(d.date)}
                </Link>
                {d.label && <span className="ml-2 text-neutral-400">— {d.label}</span>}
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
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} key={state?.savedAt || 0} className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4">
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
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add date'}
        </button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  )
}
