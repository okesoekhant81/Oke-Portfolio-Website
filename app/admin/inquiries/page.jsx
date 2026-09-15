import AdminNav from '../../../components/admin/AdminNav'
import AutoRefresh from '../../../components/admin/AutoRefresh'
import InquiriesList from '../../../components/admin/InquiriesList'
import { getInquiries } from '../../../lib/content/inquiries'
import { getInquiriesFingerprintAction } from '../../actions/inquiries'

export const dynamic = 'force-dynamic'

export default async function InquiriesAdminPage() {
  const inquiries = await getInquiries()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AutoRefresh checkAction={getInquiriesFingerprintAction} />
      <AdminNav active="/admin/inquiries" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Workshop inquiries</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Registrations submitted from the <code className="rounded bg-neutral-200 px-1">/workshop</code> page.
        </p>
        <InquiriesList inquiries={inquiries} />
      </div>
    </main>
  )
}
