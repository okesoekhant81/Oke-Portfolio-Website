'use client'

import { useState, useTransition } from 'react'
import { updateStudentClassAction } from '../../app/actions/students'
import { useSearchFilter, SearchBar } from './SearchFilterBar'

// Moving an existing student here used to mean leaving the class page,
// finding them on /admin/students (possibly scrolling through another
// class's group or Unassigned), and changing their class dropdown there —
// this does the same move (updateStudentClassAction, the same action
// ClassSelect on StudentRow uses) without leaving the page. Only lists
// students not already in this class; AddStudentToClassForm right below
// this still covers someone brand new.
export default function AssignExistingStudentForm({ classDate, candidates }) {
  const [open, setOpen] = useState(false)
  const [assigningId, setAssigningId] = useState(null)
  const [assignedIds, setAssignedIds] = useState([])
  const [error, setError] = useState(null)
  const [, startTransition] = useTransition()
  const { query, setQuery, filtered } = useSearchFilter(candidates, { searchKeys: ['name', 'email', 'phone'] })

  function handleAssign(student) {
    setAssigningId(student.id)
    setError(null)
    const formData = new FormData()
    formData.set('id', student.id)
    formData.set('classDate', classDate)
    startTransition(async () => {
      try {
        await updateStudentClassAction(formData)
        setAssignedIds((prev) => [...prev, student.id])
      } catch {
        setError(student.id)
      } finally {
        setAssigningId(null)
      }
    })
  }

  if (candidates.length === 0) return null

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-medium text-brand hover:underline"
      >
        + Assign an existing student to this class
      </button>
    )
  }

  const visible = filtered.filter((s) => !assignedIds.includes(s.id))

  return (
    <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-neutral-500">Assign an existing student</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-400 hover:text-ink">
          Close
        </button>
      </div>
      <div className="mt-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name, email, phone…" />
      </div>
      {visible.length > 0 ? (
        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {visible.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-neutral-50">
              <span className="min-w-0 text-sm">
                <span className="font-medium text-ink">{s.name}</span>{' '}
                <span className="text-xs text-neutral-400">{[s.email, s.phone].filter(Boolean).join(' · ')}</span>
              </span>
              <button
                type="button"
                onClick={() => handleAssign(s)}
                disabled={assigningId === s.id}
                className="shrink-0 rounded-md bg-brand px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
              >
                {assigningId === s.id ? 'Assigning…' : 'Assign'}
              </button>
              {error === s.id && <span className="text-xs text-red-600">Failed — retry</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-neutral-400">No matching students.</p>
      )}
    </div>
  )
}
