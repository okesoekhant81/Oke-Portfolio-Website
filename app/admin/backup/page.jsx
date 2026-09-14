import AdminNav from '../../../components/admin/AdminNav'
import BackupButton from '../../../components/admin/BackupButton'
import StorageCleanupPanel from '../../../components/admin/StorageCleanupPanel'

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

        <h2 className="mt-10 font-display text-xl font-bold italic text-brand">Storage cleanup</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Finishes the storage migration by deleting the old, unsecured copies of every data file — until this
          runs, they&apos;re still sitting at guessable URLs.
        </p>
        <div className="mt-6 rounded-xl border border-red-200 bg-white p-6">
          <StorageCleanupPanel />
        </div>
      </div>
    </main>
  )
}
