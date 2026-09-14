import { readJson, writeJson, isBlobConfigured } from '../blobStore'

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
export async function addInquiry(fields) {
  if (!isBlobConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel Blob store first.')
  }
  const existing = (await readJson(PATH)) || []
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'new',
    submittedAt: new Date().toISOString(),
    ...fields,
  }
  // Newest first, same ordering convention as getPosts.
  await writeJson(PATH, [record, ...existing])
  return record
}

export async function setInquiryStatus(id, status) {
  const existing = (await readJson(PATH)) || []
  await writeJson(
    PATH,
    existing.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry))
  )
}

export async function deleteInquiry(id) {
  const existing = (await readJson(PATH)) || []
  await writeJson(
    PATH,
    existing.filter((inquiry) => inquiry.id !== id)
  )
}
