'use server'

import { revalidatePath } from 'next/cache'
import {
  addStudent,
  updateStudent,
  deleteStudent,
  addAttendanceEntry,
  deleteAttendanceEntry,
} from '../../lib/content/students'
import { getInquiry, markInquiryConverted } from '../../lib/content/inquiries'

const MAX_LENGTHS = { name: 200, email: 200, phone: 60, business: 200, role: 120, paymentNote: 500, note: 500 }

export async function addStudentAction(prevState, formData) {
  const get = (name) => formData.get(name)?.toString().trim() ?? ''
  const name = get('name').slice(0, MAX_LENGTHS.name)
  if (!name) return { error: 'Please enter a name.' }

  try {
    await addStudent({
      name,
      email: get('email').slice(0, MAX_LENGTHS.email),
      phone: get('phone').slice(0, MAX_LENGTHS.phone),
      business: get('business').slice(0, MAX_LENGTHS.business),
      role: get('role').slice(0, MAX_LENGTHS.role),
      classDate: get('classDate'),
    })
  } catch (err) {
    return { error: err.message || 'Could not add. Please try again.' }
  }

  revalidatePath('/admin/students')
  return { success: true, savedAt: Date.now() }
}

// Copies an inquiry's own details into a new student rather than trusting
// whatever the client sends, and marks the inquiry as converted so the
// inquiries list stops offering to convert it again.
export async function convertInquiryToStudentAction(formData) {
  const inquiryId = formData.get('inquiryId')?.toString()
  if (!inquiryId) return { error: 'Missing inquiry.' }

  const inquiry = await getInquiry(inquiryId)
  if (!inquiry) return { error: 'Inquiry not found.' }
  if (inquiry.studentId) return { error: 'Already converted.', studentId: inquiry.studentId }

  let student
  try {
    student = await addStudent({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      business: inquiry.business,
      role: inquiry.role,
      classDate: inquiry.classDate || '',
      sourceInquiryId: inquiry.id,
    })
    await markInquiryConverted(inquiry.id, student.id)
  } catch (err) {
    return { error: err.message || 'Could not convert. Please try again.' }
  }

  revalidatePath('/admin/students')
  revalidatePath('/admin/inquiries')
  return { success: true, studentId: student.id }
}

export async function updateStudentClassAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  await updateStudent(id, { classDate: formData.get('classDate')?.toString() ?? '' })
  revalidatePath('/admin/students')
}

export async function updateStudentPaymentAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  await updateStudent(id, {
    paymentStatus: formData.get('paymentStatus')?.toString() || 'unpaid',
    paymentNote: formData.get('paymentNote')?.toString().trim().slice(0, MAX_LENGTHS.paymentNote) ?? '',
  })
  revalidatePath('/admin/students')
}

export async function deleteStudentAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  await deleteStudent(id)
  revalidatePath('/admin/students')
}

export async function addAttendanceAction(formData) {
  const studentId = formData.get('studentId')?.toString()
  const date = formData.get('date')?.toString()
  if (!studentId || !date) return

  const entry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    present: formData.get('present')?.toString() === 'true',
    note: formData.get('note')?.toString().trim().slice(0, MAX_LENGTHS.note) ?? '',
  }
  await addAttendanceEntry(studentId, entry)
  revalidatePath('/admin/students')
}

export async function deleteAttendanceAction(formData) {
  const studentId = formData.get('studentId')?.toString()
  const entryId = formData.get('entryId')?.toString()
  if (!studentId || !entryId) return
  await deleteAttendanceEntry(studentId, entryId)
  revalidatePath('/admin/students')
}
