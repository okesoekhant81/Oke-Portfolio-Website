'use server'

import { revalidatePath } from 'next/cache'
import { addAdminUser, deleteAdminUser } from '../../lib/content/adminUsers'
import { logActivity } from '../../lib/activityLog'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function addAdminUserAction(prevState, formData) {
  const name = formData.get('name')?.toString().trim().slice(0, 100) ?? ''
  const email = formData.get('email')?.toString().trim().slice(0, 200) ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!name) return { error: 'Please enter a name.' }
  if (!email || !EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  try {
    await addAdminUser({ name, email, password })
  } catch (err) {
    return { error: err.message || 'Could not add. Please try again.' }
  }

  await logActivity('Admin team member added', email)
  revalidatePath('/admin/team')
  return { success: true, savedAt: Date.now() }
}

export async function deleteAdminUserAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteAdminUser(id)
  await logActivity('Admin team member removed', id)
  revalidatePath('/admin/team')
}
