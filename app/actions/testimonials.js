'use server'

import { revalidatePath } from 'next/cache'
import {
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  restoreTestimonial,
  permanentlyDeleteTestimonial,
  reorderTestimonial,
} from '../../lib/content/testimonials'
import { checkSubmissionLimit, recordSubmission } from '../../lib/submissionLimits'
import { clientIp } from '../../lib/clientIp'
import { logActivity } from '../../lib/activityLog'

const MAX_LENGTHS = { name: 100, role: 120, quote: 500 }
const MIN_FILL_MS = 600

function revalidateAll() {
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  revalidatePath('/workshop')
}

function clampRating(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 5
  return Math.min(5, Math.max(1, Math.round(n)))
}

export async function addTestimonialAction(prevState, formData) {
  const get = (key) => formData.get(key)?.toString().trim() ?? ''
  const name = get('name').slice(0, MAX_LENGTHS.name)
  const quote = get('quote').slice(0, MAX_LENGTHS.quote)
  if (!name) return { error: 'Please enter a name.' }
  if (!quote) return { error: 'Please enter a quote.' }

  try {
    await addTestimonial({
      name,
      role: get('role').slice(0, MAX_LENGTHS.role),
      roleMy: get('roleMy').slice(0, MAX_LENGTHS.role),
      quote,
      quoteMy: get('quoteMy').slice(0, MAX_LENGTHS.quote),
      photo: get('photo'),
      rating: clampRating(get('rating')),
    })
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  await logActivity('Testimonial added', name)
  revalidateAll()
  return { success: true, savedAt: Date.now() }
}

export async function updateTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return { error: 'Missing testimonial.' }

  const get = (key) => formData.get(key)?.toString().trim() ?? ''
  const name = get('name').slice(0, MAX_LENGTHS.name)
  const quote = get('quote').slice(0, MAX_LENGTHS.quote)
  if (!name) return { error: 'Please enter a name.' }
  if (!quote) return { error: 'Please enter a quote.' }

  try {
    await updateTestimonial(id, {
      name,
      role: get('role').slice(0, MAX_LENGTHS.role),
      roleMy: get('roleMy').slice(0, MAX_LENGTHS.role),
      quote,
      quoteMy: get('quoteMy').slice(0, MAX_LENGTHS.quote),
      photo: get('photo'),
      rating: clampRating(get('rating')),
    })
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  await logActivity('Testimonial updated', name)
  revalidateAll()
  return { success: true }
}

// Public — reachable from the "Share your experience" form under the
// testimonials slider on the homepage and workshop page. Same bot/abuse
// defenses as submitInquiryAction: honeypot, minimum fill time, its own
// per-IP rate-limit bucket. No photo field (that goes through the
// admin-only upload endpoint) and always lands as 'pending' — never
// shown publicly until an admin approves it.
export async function submitTestimonialAction(prevState, formData) {
  const get = (key) => formData.get(key)?.toString().trim() ?? ''

  if (get('website')) return { success: true }

  const startedAt = Number(get('formStartedAt'))
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) return { success: true }

  const name = get('name').slice(0, MAX_LENGTHS.name)
  const quote = get('quote').slice(0, MAX_LENGTHS.quote)
  if (!name) return { error: 'Please enter your name.' }
  if (!quote) return { error: 'Please enter a quote.' }

  const ip = await clientIp()
  const { limited, retryAfterSeconds } = await checkSubmissionLimit('testimonial-submissions', ip)
  if (limited) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    return { error: `Too many submissions. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
  }
  await recordSubmission('testimonial-submissions', ip)

  try {
    await addTestimonial({
      name,
      role: get('role').slice(0, MAX_LENGTHS.role),
      quote,
      rating: clampRating(get('rating')),
      status: 'pending',
    })
  } catch (err) {
    return { error: err.message || 'Could not submit. Please try again.' }
  }

  await logActivity('Testimonial submitted for review', name)
  revalidatePath('/admin/testimonials')
  return { success: true }
}

export async function approveTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await updateTestimonial(id, { status: 'approved' })
  await logActivity('Testimonial approved', id)
  revalidateAll()
}

export async function deleteTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteTestimonial(id)
  await logActivity('Testimonial deleted', id)
  revalidateAll()
}

export async function restoreTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await restoreTestimonial(id)
  await logActivity('Testimonial restored', id)
  revalidatePath('/admin/trash')
  revalidateAll()
}

export async function permanentlyDeleteTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await permanentlyDeleteTestimonial(id)
  await logActivity('Testimonial permanently deleted', id)
  revalidatePath('/admin/trash')
}

export async function reorderTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  const direction = formData.get('direction')?.toString()
  if (!id || !direction) return

  await reorderTestimonial(id, direction)
  revalidateAll()
}
