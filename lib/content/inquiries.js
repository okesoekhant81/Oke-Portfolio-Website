import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

const PATH = 'content/inquiries.json'

export async function getInquiries() {
  if (!isBlobConfigured) return []
  const inquiries = await readJson(PATH)
  return inquiries || []
}

// No admin auth check in here — same as savePost/deletePost, this relies on
// only being reachable through a form on a /admin/* page, which proxy.js
// already gates. addInquiry is the one exception: it's called from the
// public registration form on /workshop, so it must stay reachable
// unauthenticated.
//
// All three use mutateJson (compare-and-swap on the blob's ETag, with
// retries) rather than a plain read-then-write: a new registration landing
// at the same moment an admin deletes or re-statuses another one is a
// real, expected occurrence here, and a plain write would let whichever
// one finishes last silently erase the other.
export async function addInquiry(fields) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'new',
    submittedAt: new Date().toISOString(),
    ...fields,
  }
  // Newest first, same ordering convention as getPosts.
  await mutateJson(PATH, (existing) => [record, ...(existing || [])])
  return record
}

export async function setInquiryStatus(id, status) {
  await mutateJson(PATH, (existing) =>
    (existing || []).map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry))
  )
}

export async function deleteInquiry(id) {
  await mutateJson(PATH, (existing) => (existing || []).filter((inquiry) => inquiry.id !== id))
}

export async function deleteInquiries(ids) {
  const idSet = new Set(ids)
  await mutateJson(PATH, (existing) => (existing || []).filter((inquiry) => !idSet.has(inquiry.id)))
}

export async function setInquiriesStatus(ids, status) {
  const idSet = new Set(ids)
  await mutateJson(PATH, (existing) =>
    (existing || []).map((inquiry) => (idSet.has(inquiry.id) ? { ...inquiry, status } : inquiry))
  )
}

export async function getInquiry(id) {
  const inquiries = await getInquiries()
  return inquiries.find((inquiry) => inquiry.id === id) || null
}

// Set once an inquiry has been converted into a student roster entry
// (see app/actions/students.js) — the inquiry itself is left in place as
// the original registration record, this just marks it so the admin view
// doesn't offer to convert the same one twice.
export async function markInquiryConverted(id, studentId) {
  await mutateJson(PATH, (existing) =>
    (existing || []).map((inquiry) => (inquiry.id === id ? { ...inquiry, studentId } : inquiry))
  )
}
