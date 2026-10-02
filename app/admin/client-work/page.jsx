import AdminNav from '../../../components/admin/AdminNav'
import ClientWorkManager from '../../../components/admin/ClientWorkManager'
import { getClientWork } from '../../../lib/content/clientWork'

export const dynamic = 'force-dynamic'

export default async function ClientWorkAdminPage() {
  const clientWork = await getClientWork()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/client-work" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Client Work</h1>
        <p className="mt-1 text-sm text-neutral-500">Selected client case studies shown on the homepage.</p>
        <ClientWorkManager clientWork={clientWork} />
      </div>
    </main>
  )
}
