import AdminNav from '../../../components/admin/AdminNav'
import WorkshopContentForm from '../../../components/admin/WorkshopContentForm'
import { getWorkshopContent } from '../../../lib/content/workshop'

export const dynamic = 'force-dynamic'

export default async function WorkshopAdminPage() {
  const content = await getWorkshopContent()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/workshop" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Workshop page</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Edits the dedicated <code className="rounded bg-neutral-200 px-1">/workshop</code> page — cover photo,
          intro, course outline, pricing, and the registration form&rsquo;s heading and body. Wrap words in{' '}
          <code className="rounded bg-neutral-200 px-1">*asterisks*</code> for emphasis or{' '}
          <code className="rounded bg-neutral-200 px-1">**double asterisks**</code> for bold. Manage individual
          class dates, status, attendance, and rosters on the{' '}
          <a href="/admin/classes" className="text-brand underline">
            Classes
          </a>{' '}
          page.
        </p>
        <WorkshopContentForm content={content} />
      </div>
    </main>
  )
}
