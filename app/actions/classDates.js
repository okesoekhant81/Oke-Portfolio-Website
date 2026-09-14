'use server'

import { revalidatePath } from 'next/cache'
import { addClassDate, updateClassDate, deleteClassDate } from '../../lib/content/classDates'
import { logActivity } from '../../lib/activityLog'

function clampFee(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n)
}

// This ends up as a real <a href> in the payment-confirmed email (see
// lib/registrantEmail.js) — even though only the admin can set it, keeping
// it restricted to http(s) rules out a stray javascript: URL ever landing
// in an email a registrant's client renders.
function cleanUrl(value) {
  const trimmed = value?.toString().trim().slice(0, 500) ?? ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : ''
}

export async function addClassDateAction(prevState, formData) {
  const date = formData.get('date')?.toString().trim() ?? ''
  const label = formData.get('label')?.toString().trim().slice(0, 100) ?? ''
  if (!date) return { error: 'Pick a date.' }

  try {
    await addClassDate({
      date,
      label,
      time: formData.get('time')?.toString().trim().slice(0, 60) ?? '',
      meetingLink: cleanUrl(formData.get('meetingLink')),
      defaultFee: clampFee(formData.get('defaultFee')),
      capacity: clampFee(formData.get('capacity')),
    })
  } catch (err) {
    return { error: err.message || 'Could not add. Please try again.' }
  }

  await logActivity('Class added', date)
  revalidatePath('/admin/classes')
  revalidatePath('/workshop')
  return { success: true, savedAt: Date.now() }
}

export async function deleteClassDateAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteClassDate(id)
  await logActivity('Class deleted', id)
  revalidatePath('/admin/classes')
  revalidatePath('/workshop')
}

const VALID_STATUSES = ['upcoming', 'in-progress', 'completed']

export async function updateClassDateStatusAction(formData) {
  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString()
  if (!id || !VALID_STATUSES.includes(status)) return

  await updateClassDate(id, { status })
  await logActivity('Class status changed', `${id} → ${status}`)
  revalidatePath('/admin/classes')
  revalidatePath('/admin/classes/[id]', 'page')
  revalidatePath('/admin/students')
}

export async function updateClassDateFeeAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await updateClassDate(id, { defaultFee: clampFee(formData.get('defaultFee')) })
  revalidatePath('/admin/classes')
  revalidatePath('/admin/classes/[id]', 'page')
}

export async function updateClassDateCapacityAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await updateClassDate(id, { capacity: clampFee(formData.get('capacity')) })
  revalidatePath('/admin/classes')
  revalidatePath('/admin/classes/[id]', 'page')
  revalidatePath('/workshop')
}

export async function updateClassDateLabelAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await updateClassDate(id, { label: formData.get('label')?.toString().trim().slice(0, 100) ?? '' })
  revalidatePath('/admin/classes')
  revalidatePath('/admin/classes/[id]', 'page')
  revalidatePath('/workshop')
}

export async function updateClassDateTimeAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await updateClassDate(id, { time: formData.get('time')?.toString().trim().slice(0, 60) ?? '' })
  revalidatePath('/admin/classes')
  revalidatePath('/admin/classes/[id]', 'page')
}

export async function updateClassDateMeetingLinkAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await updateClassDate(id, { meetingLink: cleanUrl(formData.get('meetingLink')) })
  revalidatePath('/admin/classes')
  revalidatePath('/admin/classes/[id]', 'page')
}
