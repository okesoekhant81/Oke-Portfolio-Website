import Link from 'next/link'
import AdminNav from '../../components/admin/AdminNav'
import AnalyticsPanel from '../../components/admin/AnalyticsPanel'
import { isBlobConfigured } from '../../lib/blobStore'
import { getAnalytics, getPostLikes } from '../../lib/content/analytics'
import { getInquiries } from '../../lib/content/inquiries'
import { getPosts } from '../../lib/content/posts'
import { getClassDates } from '../../lib/content/classDates'
import { getStudents } from '../../lib/content/students'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [{ postViews, daily }, postLikes, posts, inquiries, classDates, students] = await Promise.all([
    getAnalytics(),
    getPostLikes(),
    getPosts(),
    getInquiries(),
    getClassDates(),
    getStudents(),
  ])
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === 'new').length

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Dashboard</h1>

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
          <Link
            href="/admin/workshop"
            className="block rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-lg font-bold italic text-ink">Workshop page</h2>
            <p className="mt-1 text-sm text-neutral-500">Cover photo, intro, course outline, and registration CTA.</p>
          </Link>
          <Link
            href="/admin/inquiries"
            className="block rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold italic text-brand">Inquiries</h2>
              {newInquiries > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                  {newInquiries} new
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">Workshop registrations submitted by visitors.</p>
          </Link>
        </div>

        <AnalyticsPanel
          postViews={postViews}
          postLikes={postLikes}
          daily={daily}
          posts={posts}
          classDates={classDates}
          students={students}
          inquiries={inquiries}
        />
      </div>
    </main>
  )
}
