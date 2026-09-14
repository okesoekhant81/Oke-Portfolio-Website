'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { addStudentAction } from '../../app/actions/students'
import StudentRow from './StudentRow'
import { useSearchFilter, SearchBar } from './SearchFilterBar'
import { toCsv, downloadCsv } from '../../lib/csv'

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const inputClass = 'rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand'

const STATUS_STYLES = {
  upcoming: 'border-neutral-300 bg-neutral-100 text-neutral-600',
  'in-progress': 'border-brand/40 bg-brand/10 text-brand',
  completed: 'border-green-300 bg-green-50 text-green-700',
}

const STATUS_LABELS = { upcoming: 'Upcoming', 'in-progress': 'In progress', completed: 'Completed' }

function attendanceSummary(student) {
  const entries = student.attendance || []
  const present = entries.filter((a) => a.present).length
  return `${present}/${entries.length}`
}

function exportStudents(students) {
  const csv = toCsv(students, [
    { label: 'Name', value: (s) => s.name },
    { label: 'Email', value: (s) => s.email },
    { label: 'Phone', value: (s) => s.phone },
    { label: 'Business', value: (s) => s.business },
    { label: 'Role', value: (s) => s.role },
    { label: 'Class date', value: (s) => s.classDate },
    { label: 'Payment status', value: (s) => s.paymentStatus },
    { label: 'Amount paid', value: (s) => s.amountPaid },
    { label: 'Attendance (present/total)', value: attendanceSummary },
  ])
  downloadCsv(`students-${new Date().toISOString().slice(0, 10)}.csv`, csv)
}

// Grouped by class date rather than one flat list — the whole point of
// this page is "who's in which class," so that grouping should be the
// default view rather than something the admin has to filter into.
export default function StudentsManager({ students, classDates }) {
  const [state, formAction, pending] = useActionState(addStudentAction, null)
  // 'sourceInquiryId' (a converted registrant's original Registration ID,
  // same as shown on their success screen and payment-confirmed email —
  // see lib/registrantEmail.js) and 'id' (a student added directly, with
  // no source inquiry) together let the admin paste back whatever ID a
  // registrant quotes and land on the right row.
  const { query, setQuery, filtered } = useSearchFilter(students, {
    searchKeys: ['name', 'email', 'phone', 'business', 'id', 'sourceInquiryId'],
  })

  const validDates = new Set(classDates.map((d) => d.date))
  const groups = classDates.map((d) => ({
    key: d.date,
    id: d.id,
    status: d.status || 'upcoming',
    label: `${formatDate(d.date)}${d.label ? ` — ${d.label}` : ''}`,
    students: filtered.filter((s) => s.classDate === d.date),
  }))
  const unassigned = filtered.filter((s) => !s.classDate || !validDates.has(s.classDate))
  const isFiltering = query.trim().length > 0

  return (
    <div className="mt-6">
      <form
        action={formAction}
        key={state?.savedAt || 0}
        className="rounded-xl border border-neutral-200 bg-white p-4"
      >
        <p className="text-xs font-semibold text-neutral-500">Add a student</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <input name="name" required placeholder="Name" className={inputClass} />
          <input name="email" type="email" placeholder="Email" className={inputClass} />
          <input name="phone" placeholder="Phone" className={inputClass} />
          <input name="business" placeholder="Business (optional)" className={inputClass} />
          <input name="role" placeholder="Role (optional)" className={inputClass} />
          <select name="classDate" defaultValue="" className={inputClass}>
            <option value="">Unassigned</option>
            {classDates.map((d) => (
              <option key={d.id} value={d.date}>
                {formatDate(d.date)}
                {d.label ? ` — ${d.label}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {pending ? 'Adding…' : 'Add student'}
          </button>
          {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        </div>
      </form>

      {students.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          No students yet — add one above, or convert an enrolled inquiry from the{' '}
          <a href="/admin/inquiries" className="text-brand underline">
            Inquiries
          </a>{' '}
          page.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search name, email, phone…" />
            <button
              type="button"
              onClick={() => exportStudents(filtered)}
              className="ml-auto rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-brand hover:text-brand"
            >
              Export CSV
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500">No students match your search.</p>
          ) : (
            <div className="mt-6 space-y-8">
              {groups
                .filter((group) => group.students.length > 0 || !isFiltering)
                .map((group) => (
                  <div key={group.key}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/classes/${group.id}`}
                        className="text-xs font-semibold tracking-wide text-neutral-500 uppercase hover:text-brand"
                      >
                        {group.label} · {group.students.length}
                      </Link>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[group.status] || STATUS_STYLES.upcoming}`}
                      >
                        {STATUS_LABELS[group.status] || 'Upcoming'}
                      </span>
                    </div>
                    {group.students.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {group.students.map((s) => (
                          <StudentRow key={s.id} student={s} classDates={classDates} />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-neutral-400">No students assigned yet.</p>
                    )}
                  </div>
                ))}

              {unassigned.length > 0 && (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                    Unassigned · {unassigned.length}
                  </p>
                  <div className="mt-3 space-y-3">
                    {unassigned.map((s) => (
                      <StudentRow key={s.id} student={s} classDates={classDates} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
