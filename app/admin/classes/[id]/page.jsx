import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../../../components/admin/AdminNav'
import ClassAttendanceSheet from '../../../../components/admin/ClassAttendanceSheet'
import { getClassDate } from '../../../../lib/content/classDates'
import { getStudents } from '../../../../lib/content/students'

export const dynamic = 'force-dynamic'

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const STATUS_LABELS = { upcoming: 'Upcoming', 'in-progress': 'In progress', completed: 'Completed' }

export default async function ClassDetailPage({ params }) {
  const { id } = await params
  const [classInfo, allStudents] = await Promise.all([getClassDate(id), getStudents()])
  if (!classInfo) notFound()

  const students = allStudents.filter((s) => s.classDate === classInfo.date)
  const totalRevenue = students.reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0)

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/students" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/admin/students" className="text-xs text-brand hover:underline">
          ← All students
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold italic text-brand">
          {formatDate(classInfo.date)}
          {classInfo.label ? ` — ${classInfo.label}` : ''}
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">Students</p>
            <p className="mt-1 text-2xl font-bold text-ink">{students.length}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">Revenue collected</p>
            <p className="mt-1 text-2xl font-bold text-ink">{totalRevenue.toLocaleString()} MMK</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">Status</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {STATUS_LABELS[classInfo.status] || 'Upcoming'}
            </p>
          </div>
        </div>

        <ClassAttendanceSheet classId={classInfo.id} students={students} />

        {students.length > 0 && (
          <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-500">Roster</p>
            <ul className="mt-3 space-y-2">
              {students.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink">{s.name}</span>
                  <span className="text-xs text-neutral-400">
                    {(s.amountPaid || 0).toLocaleString()} MMK — {s.paymentStatus || 'unpaid'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
