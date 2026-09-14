import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../../../components/admin/AdminNav'
import PrintableCertificate from '../../../../components/admin/PrintableCertificate'
import PrintButton from '../../../../components/admin/PrintButton'
import { getStudent } from '../../../../lib/content/students'
import { getClassDates } from '../../../../lib/content/classDates'
import { getWorkshopContent } from '../../../../lib/content/workshop'
import { SITE_NAME } from '../../../../lib/site'

export const dynamic = 'force-dynamic'

export default async function CertificatePage({ params }) {
  const { id } = await params
  const [student, classDates, workshop] = await Promise.all([getStudent(id), getClassDates(), getWorkshopContent()])
  if (!student) notFound()

  const assignedClass = classDates.find((d) => d.date === student.classDate)
  const courseName = assignedClass?.label || `${workshop.heroTitle} ${workshop.heroSubtitle}`

  return (
    <main className="min-h-screen bg-neutral-50 print:bg-white">
      <div className="print:hidden">
        <AdminNav active="/admin/students" />
      </div>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link href="/admin/students" className="text-xs text-brand hover:underline">
            ← Students
          </Link>
          <PrintButton label="Print certificate" />
        </div>
        <div className="mt-8">
          <PrintableCertificate
            studentName={student.name}
            courseName={courseName}
            classDate={student.classDate}
            issuerName={SITE_NAME}
          />
        </div>
      </div>
    </main>
  )
}
