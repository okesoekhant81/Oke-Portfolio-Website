import AdminNav from '../../../components/admin/AdminNav'
import SubscribersList from '../../../components/admin/SubscribersList'
import { getSubscribers } from '../../../lib/content/newsletter'

export const dynamic = 'force-dynamic'

export default async function SubscribersAdminPage() {
  const subscribers = await getSubscribers()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/subscribers" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Subscribers</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Newsletter emails collected from the Contact section on every page. {subscribers.length} total.
        </p>
        {subscribers.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">No subscribers yet.</p>
        ) : (
          <SubscribersList subscribers={subscribers} />
        )}
      </div>
    </main>
  )
}
