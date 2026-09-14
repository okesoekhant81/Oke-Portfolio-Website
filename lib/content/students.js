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

export async function addAttendanceEntry(studentId, entry) {
  await mutateJson(PATH, (existing) =>
    (existing || []).map((s) => (s.id === studentId ? { ...s, attendance: [...(s.attendance || []), entry] } : s))
  )
}

export async function deleteAttendanceEntry(studentId, entryId) {
  await mutateJson(PATH, (existing) =>
    (existing || []).map((s) =>
      s.id === studentId ? { ...s, attendance: (s.attendance || []).filter((a) => a.id !== entryId) } : s
    )
  )
}
