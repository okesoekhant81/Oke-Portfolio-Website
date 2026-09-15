import AdminNav from '../../../components/admin/AdminNav'
import AutoRefresh from '../../../components/admin/AutoRefresh'
import StudentsManager from '../../../components/admin/StudentsManager'
import { getStudents } from '../../../lib/content/students'
import { getClassDates } from '../../../lib/content/classDates'
import { getStudentsFingerprintAction } from '../../actions/students'

export const dynamic = 'force-dynamic'

export default async function StudentsAdminPage() {
  const [students, classDates] = await Promise.all([getStudents(), getClassDates()])

  return (
    <main className="min-h-screen bg-neutral-50">
      <AutoRefresh checkAction={getStudentsFingerprintAction} />
      <AdminNav active="/admin/students" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Students</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Assign students to a class date, and track attendance and payment status.
        </p>
        <StudentsManager students={students} classDates={classDates} />
      </div>
    </main>
  )
}
