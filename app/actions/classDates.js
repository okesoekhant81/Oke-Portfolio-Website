'use server'

import { revalidatePath } from 'next/cache'
import { addClassDate, updateClassDate, deleteClassDate } from '../../lib/content/classDates'

export async function addClassDateAction(prevState, formData) {
  const date = formData.get('date')?.toString().trim() ?? ''
  const label = formData.get('label')?.toString().trim().slice(0, 100) ?? ''
  if (!date) return { error: 'Pick a date.' }

  try {
    await addClassDate({ date, label })
  } catch (err) {
    return { error: err.message || 'Could not add. Please try again.' }
  }

  revalidatePath('/admin/workshop')
  revalidatePath('/workshop')
  return { success: true, savedAt: Date.now() }
}

export async function deleteClassDateAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteClassDate(id)
  revalidatePath('/admin/workshop')
  revalidatePath('/workshop')
}

const VALID_STATUSES = ['upcoming', 'in-progress', 'completed']

export async function updateClassDateStatusAction(formData) {
  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString()
  if (!id || !VALID_STATUSES.includes(status)) return

  await updateClassDate(id, { status })
  revalidatePath('/admin/workshop')
  revalidatePath(`/admin/classes/${id}`)
  revalidatePath('/admin/students')
}
