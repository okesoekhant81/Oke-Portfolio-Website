'use server'

import { revalidatePath } from 'next/cache'
import {
  addStudent,
  updateStudent,
  deleteStudent,
  restoreStudent,
  permanentlyDeleteStudent,
  setAttendance,
  deleteAttendanceEntry,
  setAttendanceForClass,
  getStudent,
} from '../../lib/content/students'
import { getInquiry, markInquiryConverted } from '../../lib/content/inquiries'
import { getClassDates } from '../../lib/content/classDates'
import { getWorkshopContent } from '../../lib/content/workshop'
import { localizeWorkshopContent } from '../../lib/localizeContent'
import { sendRegistrationConfirmation } from '../../lib/registrantEmail'
import { logActivity } from '../../lib/activityLog'

const MAX_LENGTHS = { name: 200, email: 200, phone: 60, business: 200, role: 120, paymentNote: 500, note: 500 }

function clampAmount(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n)
}

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

  await logActivity('Student added', name)
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
      locale: inquiry.locale || 'en',
      paymentProofUrl: inquiry.paymentProofUrl || '',
    })
    await markInquiryConverted(inquiry.id, student.id)
  } catch (err) {
    return { error: err.message || 'Could not convert. Please try again.' }
  }

  await logActivity('Inquiry converted to student', inquiry.name)
  revalidatePath('/admin/students')
  revalidatePath('/admin/inquiries')
  return { success: true, studentId: student.id }
}

// Name/email/phone/business/role were only ever settable at creation —
// there was no way back into them afterward, so a typo at add-time (or an
// inquiry converted with one already in it) was permanent short of
// deleting the student and losing their payment/attendance history.
export async function updateStudentProfileAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return { error: 'Missing student.' }

  const get = (name) => formData.get(name)?.toString().trim() ?? ''
  const name = get('name').slice(0, MAX_LENGTHS.name)
  if (!name) return { error: 'Please enter a name.' }

  await updateStudent(id, {
    name,
    email: get('email').slice(0, MAX_LENGTHS.email),
    phone: get('phone').slice(0, MAX_LENGTHS.phone),
    business: get('business').slice(0, MAX_LENGTHS.business),
    role: get('role').slice(0, MAX_LENGTHS.role),
  })
  await logActivity('Student profile updated', name)
  revalidatePath('/admin/students')
  revalidatePath('/admin/classes/[id]', 'page')
  return { success: true }
}

export async function updateStudentClassAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  await updateStudent(id, { classDate: formData.get('classDate')?.toString() ?? '' })
  revalidatePath('/admin/students')
}

// The registration-confirmed email (see lib/registrantEmail.js) fires from
// here, not at registration time — only once the admin has actually
// checked the payment themselves and marks it paid, and only on the
// transition into 'paid' (re-saving an already-paid student, e.g. to
// tweak amountPaid, doesn't re-send it).
export async function updateStudentPaymentAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  const previous = await getStudent(id)
  const paymentStatus = formData.get('paymentStatus')?.toString() || 'unpaid'
  const amountPaid = clampAmount(formData.get('amountPaid'))
  await updateStudent(id, {
    paymentStatus,
    paymentNote: formData.get('paymentNote')?.toString().trim().slice(0, MAX_LENGTHS.paymentNote) ?? '',
    amountPaid,
  })

  if (previous && previous.paymentStatus !== 'paid' && paymentStatus === 'paid' && previous.classDate) {
    const [classInfo, rawWorkshop] = await Promise.all([
      getClassDates().then((dates) => dates.find((d) => d.date === previous.classDate)),
      getWorkshopContent(),
    ])
    if (classInfo) {
      const workshop = localizeWorkshopContent(rawWorkshop, previous.locale || 'en')
      await sendRegistrationConfirmation(previous, classInfo, workshop, previous.locale || 'en')
    }
  }

  await logActivity('Student payment updated', `${id}: ${amountPaid} MMK`)
  revalidatePath('/admin/students')
  revalidatePath('/admin/classes/[id]', 'page')
}

export async function deleteStudentAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  await deleteStudent(id)
  await logActivity('Student deleted', id)
  revalidatePath('/admin/students')
}

export async function restoreStudentAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  await restoreStudent(id)
  await logActivity('Student restored', id)
  revalidatePath('/admin/students')
  revalidatePath('/admin/trash')
}

export async function permanentlyDeleteStudentAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return
  await permanentlyDeleteStudent(id)
  await logActivity('Student permanently deleted', id)
  revalidatePath('/admin/trash')
}

export async function addAttendanceAction(formData) {
  const studentId = formData.get('studentId')?.toString()
  const date = formData.get('date')?.toString()
  if (!studentId || !date) return

  await setAttendance(
    studentId,
    date,
    formData.get('present')?.toString() === 'true',
    formData.get('note')?.toString().trim().slice(0, MAX_LENGTHS.note) ?? ''
  )
  revalidatePath('/admin/students')
  revalidatePath('/admin/classes/[id]', 'page')
}

export async function deleteAttendanceAction(formData) {
  const studentId = formData.get('studentId')?.toString()
  const entryId = formData.get('entryId')?.toString()
  if (!studentId || !entryId) return
  await deleteAttendanceEntry(studentId, entryId)
  revalidatePath('/admin/students')
  revalidatePath('/admin/classes/[id]', 'page')
}

// Attendance for a whole class, one session date at a time — records is
// [{ studentId, present, note }] for every student shown on the class
// page's attendance sheet at save time.
export async function saveClassAttendanceAction(formData) {
  const classId = formData.get('classId')?.toString()
  const date = formData.get('date')?.toString()
  const studentIds = formData.getAll('studentId').map((v) => v.toString())
  if (!classId || !date || studentIds.length === 0) return { error: 'Nothing to save.' }

  const records = studentIds.map((studentId) => ({
    studentId,
    present: formData.get(`present-${studentId}`)?.toString() === 'true',
    note: '',
  }))

  try {
    await setAttendanceForClass(date, records)
  } catch (err) {
    return { error: err.message || 'Could not save attendance. Please try again.' }
  }

  revalidatePath('/admin/students')
  revalidatePath('/admin/classes/[id]', 'page')
  return { success: true, savedAt: Date.now() }
}
