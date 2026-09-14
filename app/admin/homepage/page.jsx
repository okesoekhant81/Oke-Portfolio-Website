import AdminNav from '../../../components/admin/AdminNav'
import HomepageForm from '../../../components/admin/HomepageForm'
import { getHomepageContent } from '../../../lib/content/homepage'

export const dynamic = 'force-dynamic'

export default async function HomepageAdminPage() {
  const content = await getHomepageContent()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/homepage" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Homepage content</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Wrap words in <code className="rounded bg-neutral-200 px-1">*asterisks*</code> for emphasis or{' '}
          <code className="rounded bg-neutral-200 px-1">**double asterisks**</code> for bold. Blank line = new
          paragraph.
        </p>
        <HomepageForm content={content} />
      </div>
    </main>
  )
}
