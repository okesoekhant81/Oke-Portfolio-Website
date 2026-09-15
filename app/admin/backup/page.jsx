import AdminNav from '../../../components/admin/AdminNav'
import BackupButton from '../../../components/admin/BackupButton'
import DbHardeningPanel from '../../../components/admin/DbHardeningPanel'
import DbDiagnosticButton from '../../../components/admin/DbDiagnosticButton'
import DbRemigrationPanel from '../../../components/admin/DbRemigrationPanel'

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

        <h2 className="mt-10 font-display text-xl font-bold italic text-brand">Database security</h2>
        <p className="mt-1 text-sm text-neutral-500">
          One-time hardening for the Postgres tables added in the last update.
        </p>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <DbHardeningPanel />
        </div>

        <h2 className="mt-10 font-display text-xl font-bold italic text-brand">Database diagnostic</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Investigating why the Postgres copy lost fields before re-attempting the cutover.
        </p>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <DbDiagnosticButton />
        </div>

        <h2 className="mt-10 font-display text-xl font-bold italic text-brand">Database re-migration</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Fixes the encoding bug: wipes the broken Postgres copy and re-copies from Blob correctly.
        </p>
        <div className="mt-6 rounded-xl border border-red-200 bg-white p-6">
          <DbRemigrationPanel />
        </div>
      </div>
    </main>
  )
}
