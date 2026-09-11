import Link from 'next/link'
import AdminNav from '../../components/admin/AdminNav'
import { isBlobConfigured } from '../../lib/blobStore'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>

        {!isBlobConfigured && (
          <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Storage isn&rsquo;t connected yet — the site is showing bundled default content. Connect a Vercel Blob
            store in the Vercel dashboard, then redeploy, to start editing for real.
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/homepage"
            className="block rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-lg font-bold italic text-ink">Homepage</h2>
            <p className="mt-1 text-sm text-neutral-500">Edit every section — hero, services, workshop, contact.</p>
          </Link>
          <Link
            href="/admin/posts"
            className="block rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-lg font-bold italic text-brand">Articles</h2>
            <p className="mt-1 text-sm text-neutral-500">Write, edit, and publish blog posts.</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
