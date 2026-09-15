import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../../../components/admin/AdminNav'
import AddStudentToClassForm from '../../../../components/admin/AddStudentToClassForm'
import AssignExistingStudentForm from '../../../../components/admin/AssignExistingStudentForm'
import ClassAttendanceSheet from '../../../../components/admin/ClassAttendanceSheet'
import StudentRow from '../../../../components/admin/StudentRow'
import PrintRosterButton from '../../../../components/admin/PrintRosterButton'
import PrintableRoster from '../../../../components/admin/PrintableRoster'
import { getClassDate, getClassDates } from '../../../../lib/content/classDates'
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
  const [classInfo, allClassDates, allStudents] = await Promise.all([getClassDate(id), getClassDates(), getStudents()])
  if (!classInfo) notFound()

  const students = allStudents.filter((s) => s.classDate === classInfo.date)
  const otherStudents = allStudents.filter((s) => s.classDate !== classInfo.date)
  const totalRevenue = students.reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0)
  const classLabel = `${formatDate(classInfo.date)}${classInfo.label ? ` — ${classInfo.label}` : ''}`

  return (
    <main className="min-h-screen bg-neutral-50 print:bg-white">
      <div className="print:hidden">
        <AdminNav active="/admin/classes" />
      </div>
      <PrintableRoster classLabel={classLabel} students={students} />
      <div className="mx-auto max-w-4xl px-6 py-10 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/classes" className="text-xs text-brand hover:underline">
            ← All classes
          </Link>
          <PrintRosterButton />
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold italic text-brand">{classLabel}</h1>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">Students</p>
            <p className="mt-1 text-2xl font-bold text-ink">{students.length}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">Revenue collected</p>
            <p className="mt-1 text-2xl font-bold text-ink">{totalRevenue.toLocaleString()} MMK</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">Default fee</p>
            <p className="mt-1 text-2xl font-bold text-ink">{(classInfo.defaultFee || 0).toLocaleString()} MMK</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">Status</p>
            <p className="mt-1 text-sm font-semibold text-ink">{STATUS_LABELS[classInfo.status] || 'Upcoming'}</p>
          </div>
        </div>

        <ClassAttendanceSheet classId={classInfo.id} students={students} />

        <div className="mt-8">
          <p className="text-xs font-semibold text-neutral-500">Roster</p>
          {students.length > 0 ? (
            <div className="mt-3 space-y-3">
              {students.map((s) => (
                <StudentRow key={s.id} student={s} classDates={allClassDates} />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">No students assigned to this class yet.</p>
          )}
          <AssignExistingStudentForm classDate={classInfo.date} candidates={otherStudents} />
        </div>

        <AddStudentToClassForm classDate={classInfo.date} />
      </div>
    </main>
  )
}
