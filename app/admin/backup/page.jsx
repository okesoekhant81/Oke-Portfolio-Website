import AdminNav from '../../../components/admin/AdminNav'
import BackupButton from '../../../components/admin/BackupButton'
import StorageMigrationPanel from '../../../components/admin/StorageMigrationPanel'

export const dynamic = 'force-dynamic'

export default function BackupAdminPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/backup" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Backup</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Downloads a single JSON snapshot of everything the admin panel manages — homepage, about, workshop, and
          article content, testimonials, classes, students, inquiries, and newsletter subscribers. Worth keeping
          somewhere safe in case the storage backing this site is ever lost.
        </p>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <BackupButton />
        </div>

        <h2 className="mt-10 font-display text-xl font-bold italic text-brand">Storage migration</h2>
        <p className="mt-1 text-sm text-neutral-500">
          One-time, two-step move to storage that isn&apos;t cached the same way — this is what fixes edits/deletes
          sometimes taking a while (or a refresh) to show up. Nothing on the live site changes until both steps
          below are done and a follow-up update switches the app over.
        </p>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <StorageMigrationPanel />
        </div>
      </div>
    </main>
  )
}
