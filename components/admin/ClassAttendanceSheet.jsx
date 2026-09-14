'use client'

import { useMemo, useState, useTransition } from 'react'
import { saveClassAttendanceAction } from '../../app/actions/students'

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Defaults every student to Present for whichever date is selected — real
// attendance-taking is "assume everyone showed up, uncheck the no-shows,"
// not ticking each name in one by one — and falls back to whatever was
// already saved if this date has been recorded before.
export default function ClassAttendanceSheet({ classId, students }) {
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [overrides, setOverrides] = useState({})
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const sessionDates = useMemo(() => {
    const set = new Set()
    students.forEach((s) => (s.attendance || []).forEach((a) => set.add(a.date)))
    return [...set].sort()
  }, [students])

  function presentFor(student) {
    if (overrides[student.id] !== undefined) return overrides[student.id]
    const existing = (student.attendance || []).find((a) => a.date === selectedDate)
    return existing ? existing.present : true
  }

  function toggle(student) {
    setSaved(false)
    setOverrides((prev) => ({ ...prev, [student.id]: !presentFor(student) }))
  }

  function changeDate(next) {
    setSelectedDate(next)
    setOverrides({})
    setSaved(false)
  }

  function handleSave() {
    setError(null)
    const formData = new FormData()
    formData.set('classId', classId)
    formData.set('date', selectedDate)
    students.forEach((s) => {
      formData.append('studentId', s.id)
      formData.set(`present-${s.id}`, presentFor(s) ? 'true' : 'false')
    })
    startTransition(async () => {
      try {
        const result = await saveClassAttendanceAction(formData)
        if (result?.error) {
          setError(result.error)
        } else {
          setOverrides({})
          setSaved(true)
        }
      } catch {
        setError('Could not save. Please try again.')
      }
    })
  }

  if (students.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-xs font-semibold text-neutral-500">Attendance</p>
        <p className="mt-2 text-sm text-neutral-400">No students assigned to this class yet.</p>
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-neutral-500">Attendance</p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => changeDate(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
          />
          {sessionDates.length > 0 && (
            <select
              value=""
              onChange={(e) => e.target.value && changeDate(e.target.value)}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-brand"
            >
              <option value="">Jump to a past session…</option>
              {sessionDates.map((d) => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <ul className="mt-3 divide-y divide-neutral-100">
        {students.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-ink">{s.name}</span>
            <label className="flex items-center gap-1.5 text-xs text-neutral-600">
              <input type="checkbox" checked={presentFor(s)} onChange={() => toggle(s)} />
              Present
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {pending ? 'Saving…' : `Save attendance for ${formatDate(selectedDate)}`}
        </button>
        {saved && <span className="text-sm text-green-600">Saved.</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
