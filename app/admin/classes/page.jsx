import AdminNav from '../../../components/admin/AdminNav'
import ClassesManager from '../../../components/admin/ClassesManager'
import { getClassDates } from '../../../lib/content/classDates'
import { getStudents } from '../../../lib/content/students'

export const dynamic = 'force-dynamic'

export default async function ClassesAdminPage() {
  const [classDates, students] = await Promise.all([getClassDates(), getStudents()])

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/classes" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Classes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Add and manage workshop class dates — status, default fee, headcount, and revenue. Click a class for its
          roster and attendance.
        </p>
        <ClassesManager dates={classDates} students={students} />
      </div>
    </main>
  )
}
