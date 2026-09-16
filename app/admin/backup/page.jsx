import AdminNav from '../../../components/admin/AdminNav'
import BackupButton from '../../../components/admin/BackupButton'
import OrphanedImagesReport from '../../../components/admin/OrphanedImagesReport'
import PostsSplitMigrationTool from '../../../components/admin/PostsSplitMigrationTool'

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

        <h2 className="mt-10 font-display text-xl font-bold italic text-brand">Orphaned images</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Scans every uploaded image against everything it could still be referenced from, and lists any that
          aren't referenced anywhere anymore — usually old uploads left behind after an image was replaced. This
          only reports; it doesn't delete anything.
        </p>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <OrphanedImagesReport />
        </div>

        <h2 className="mt-10 font-display text-xl font-bold italic text-brand">Posts storage split (one-time)</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Splits articles into a lightweight list file plus one file per article, without touching the current
          storage. Run this, then let Claude know so the site can be switched over to read from it — this step
          alone changes nothing live.
        </p>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <PostsSplitMigrationTool />
        </div>
      </div>
    </main>
  )
}
