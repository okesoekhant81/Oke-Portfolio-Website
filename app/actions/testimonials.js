'use server'

import { revalidatePath } from 'next/cache'
import { addTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonial } from '../../lib/content/testimonials'

const MAX_LENGTHS = { name: 100, role: 120, quote: 500 }

function revalidateAll() {
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  revalidatePath('/workshop')
}

export async function addTestimonialAction(prevState, formData) {
  const get = (key) => formData.get(key)?.toString().trim() ?? ''
  const name = get('name').slice(0, MAX_LENGTHS.name)
  const quote = get('quote').slice(0, MAX_LENGTHS.quote)
  if (!name) return { error: 'Please enter a name.' }
  if (!quote) return { error: 'Please enter a quote.' }

  try {
    await addTestimonial({ name, role: get('role').slice(0, MAX_LENGTHS.role), quote, photo: get('photo') })
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

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
    await updateTestimonial(id, { name, role: get('role').slice(0, MAX_LENGTHS.role), quote, photo: get('photo') })
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  revalidateAll()
  return { success: true }
}

export async function deleteTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteTestimonial(id)
  revalidateAll()
}

export async function reorderTestimonialAction(formData) {
  const id = formData.get('id')?.toString()
  const direction = formData.get('direction')?.toString()
  if (!id || !direction) return

  await reorderTestimonial(id, direction)
  revalidateAll()
}
