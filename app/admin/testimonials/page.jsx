import AdminNav from '../../../components/admin/AdminNav'
import TestimonialsManager from '../../../components/admin/TestimonialsManager'
import { getTestimonials } from '../../../lib/content/testimonials'

export const dynamic = 'force-dynamic'

export default async function TestimonialsAdminPage() {
  const testimonials = await getTestimonials()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/testimonials" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Testimonials</h1>
        <p className="mt-1 text-sm text-neutral-500">Student quotes shown as social proof on the public site.</p>
        <TestimonialsManager testimonials={testimonials} />
      </div>
    </main>
  )
}
