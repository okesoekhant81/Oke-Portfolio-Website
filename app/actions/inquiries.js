'use server'

import { revalidatePath } from 'next/cache'
import { addInquiry, deleteInquiry, setInquiryStatus } from '../../lib/content/inquiries'

// Public — reachable from the unauthenticated /workshop registration form,
// so it validates its own input rather than trusting the client.
export async function submitInquiryAction(prevState, formData) {
  const get = (name) => formData.get(name)?.toString().trim() ?? ''

  const name = get('name')
  const email = get('email')
  const phone = get('phone')

  if (!name) return { error: 'Please enter your name.' }
  if (!email) return { error: 'Please enter your email.' }
  if (!phone) return { error: 'Please enter your phone number.' }

  try {
    await addInquiry({
      name,
      email,
      phone,
      business: get('business'),
      role: get('role'),
      participants: get('participants'),
      message: get('message'),
    })
  } catch (err) {
    return { error: err.message || 'Could not submit. Please try again.' }
  }

  return { success: true }
}

// Both of the below rely on only being reachable through a form on
// /admin/inquiries, which proxy.js gates — same pattern as deletePostAction.
export async function updateInquiryStatusAction(formData) {
  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString()
  if (!id || !status) return

  await setInquiryStatus(id, status)
  revalidatePath('/admin/inquiries')
}

export async function deleteInquiryAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteInquiry(id)
  revalidatePath('/admin/inquiries')
}
