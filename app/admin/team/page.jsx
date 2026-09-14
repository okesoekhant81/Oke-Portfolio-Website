import AdminNav from '../../../components/admin/AdminNav'
import TeamManager from '../../../components/admin/TeamManager'
import { getAdminUsers } from '../../../lib/content/adminUsers'

export const dynamic = 'force-dynamic'

export default async function TeamAdminPage() {
  const users = await getAdminUsers()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/team" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Team</h1>
        <p className="mt-1 text-sm text-neutral-500">Give other people their own admin login instead of sharing the master password.</p>
        <TeamManager users={users} />
      </div>
    </main>
  )
}
