import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

const PATH = 'content/students.json'

export async function getStudents() {
  if (!isBlobConfigured) return []
  const students = await readJson(PATH)
  return students || []
}

// No admin auth check — reachable only through /admin/students, which
// proxy.js gates, same pattern as inquiries/classDates. All mutations go
// through mutateJson (ETag compare-and-swap, see lib/blobStore.js) since
// this file is read-modify-written from several places that can land
// close together: assigning a class, logging attendance, and updating
// payment status are all separate admin actions against the same list.
export async function addStudent(fields) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    classDate: '',
    paymentStatus: 'unpaid',
    paymentNote: '',
    amountPaid: 0,
    attendance: [],
    sourceInquiryId: null,
    ...fields,
  }
  await mutateJson(PATH, (existing) => [record, ...(existing || [])])
  return record
}

export async function updateStudent(id, patch) {
  await mutateJson(PATH, (existing) => (existing || []).map((s) => (s.id === id ? { ...s, ...patch } : s)))
}

export async function deleteStudent(id) {
  await mutateJson(PATH, (existing) => (existing || []).filter((s) => s.id !== id))
}

export async function getStudent(id) {
  const students = await getStudents()
  return students.find((s) => s.id === id) || null
}

function upsertAttendance(attendance, date, present, note) {
  const list = attendance || []
  const idx = list.findIndex((a) => a.date === date)
  const entry = {
    id: idx >= 0 ? list[idx].id : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    present,
    note: note || '',
  }
  return idx >= 0 ? list.map((a, i) => (i === idx ? entry : a)) : [...list, entry]
}

// One entry per (student, date) — re-marking a date updates the existing
// entry instead of stacking a duplicate, which mattered once attendance
// could also be set in bulk from the class page (see setAttendanceForClass)
// alongside the original per-student panel.
export async function setAttendance(studentId, date, present, note) {
  await mutateJson(PATH, (existing) =>
    (existing || []).map((s) => (s.id === studentId ? { ...s, attendance: upsertAttendance(s.attendance, date, present, note) } : s))
  )
}

export async function deleteAttendanceEntry(studentId, entryId) {
  await mutateJson(PATH, (existing) =>
    (existing || []).map((s) =>
      s.id === studentId ? { ...s, attendance: (s.attendance || []).filter((a) => a.id !== entryId) } : s
    )
  )
}

// Attendance-taking for a whole class in one save — one read-modify-write
// over every affected student rather than one mutateJson round trip per
// student, which also avoids each student's write racing the next one's
// read within the same submission.
export async function setAttendanceForClass(date, records) {
  const byStudent = new Map(records.map((r) => [r.studentId, r]))
  await mutateJson(PATH, (existing) =>
    (existing || []).map((s) => {
      const record = byStudent.get(s.id)
      if (!record) return s
      return { ...s, attendance: upsertAttendance(s.attendance, date, record.present, record.note) }
    })
  )
}
