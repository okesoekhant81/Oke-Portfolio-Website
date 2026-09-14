import AdminNav from '../../../components/admin/AdminNav'
import TrashManager from '../../../components/admin/TrashManager'
import { getStudents } from '../../../lib/content/students'
import { getPosts } from '../../../lib/content/posts'
import { getTestimonials } from '../../../lib/content/testimonials'

export const dynamic = 'force-dynamic'

export default async function TrashPage() {
  const [students, posts, testimonials] = await Promise.all([
    getStudents({ includeDeleted: true }),
    getPosts({ includeUnpublished: true, includeDeleted: true }),
    getTestimonials({ includeDeleted: true }),
  ])

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/trash" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Trash</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Deleted students, articles, and testimonials, kept here until you remove them for good.
        </p>
        <TrashManager
          students={students.filter((s) => s.deletedAt)}
          posts={posts.filter((p) => p.deletedAt)}
          testimonials={testimonials.filter((t) => t.deletedAt)}
        />
      </div>
    </main>
  )
}
