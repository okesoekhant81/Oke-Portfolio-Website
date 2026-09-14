import AdminNav from '../../../components/admin/AdminNav'
import AboutContentForm from '../../../components/admin/AboutContentForm'
import { getAboutContent } from '../../../lib/content/about'

export const dynamic = 'force-dynamic'

export default async function AboutAdminPage() {
  const content = await getAboutContent()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/about" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">About page</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Edits the dedicated <code className="rounded bg-neutral-200 px-1">/about</code> page — intro, key stats,
          experience, and skills. Wrap words in <code className="rounded bg-neutral-200 px-1">*asterisks*</code> for
          emphasis or <code className="rounded bg-neutral-200 px-1">**double asterisks**</code> for bold.
        </p>
        <AboutContentForm content={content} />
      </div>
    </main>
  )
}
