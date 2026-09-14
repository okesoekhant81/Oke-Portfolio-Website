import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

const PATH = 'content/testimonials.json'

// A curated list, admin-managed only (never written to from the public
// site) — but still goes through mutateJson (ETag compare-and-swap, see
// lib/blobStore.js) rather than a plain read-then-write, since add/delete/
// reorder are each a read-modify-write against the same shared file and two
// of them landing close together would otherwise silently drop one.
export async function getTestimonials() {
  if (!isBlobConfigured) return []
  const testimonials = await readJson(PATH)
  return testimonials || []
}

// status defaults to 'approved' — an admin adding one directly is
// curating it themselves, nothing to review. The public submission form
// (submitTestimonialAction) is the one caller that passes 'pending'
// explicitly, since that one nobody has vetted yet.
export async function addTestimonial({ name, role, roleMy, quote, quoteMy, photo, rating, status = 'approved' }) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    role,
    roleMy,
    quote,
    quoteMy,
    photo,
    rating,
    status,
  }
  await mutateJson(PATH, (existing) => [...(existing || []), record])
  return record
}

export async function updateTestimonial(id, patch) {
  await mutateJson(PATH, (existing) => (existing || []).map((t) => (t.id === id ? { ...t, ...patch } : t)))
}

export async function deleteTestimonial(id) {
  await mutateJson(PATH, (existing) => (existing || []).filter((t) => t.id !== id))
}

export async function reorderTestimonial(id, direction) {
  await mutateJson(PATH, (existing) => {
    const list = existing || []
    const index = list.findIndex((t) => t.id === id)
    if (index === -1) return list
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (swapWith < 0 || swapWith >= list.length) return list
    const next = [...list]
    ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
    return next
  })
}
