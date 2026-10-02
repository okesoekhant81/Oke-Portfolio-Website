import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

const PATH = 'content/client-work.json'

// A curated list, admin-managed only — same mutateJson (ETag compare-and-
// swap, see lib/blobStore.js) reasoning as testimonials.js: add/update/
// delete/reorder are each a read-modify-write against the same shared
// file, and two landing close together would otherwise silently drop one.
export async function getClientWork() {
  if (!isBlobConfigured) return []
  return (await readJson(PATH)) || []
}

export async function addClientWork({ name, scope, scopeMy, description, descriptionMy, highlight, highlightMy }) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    scope,
    scopeMy,
    description,
    descriptionMy,
    highlight,
    highlightMy,
  }
  await mutateJson(PATH, (existing) => [...(existing || []), record])
  return record
}

export async function updateClientWork(id, patch) {
  await mutateJson(PATH, (existing) => (existing || []).map((w) => (w.id === id ? { ...w, ...patch } : w)))
}

export async function deleteClientWork(id) {
  await mutateJson(PATH, (existing) => (existing || []).filter((w) => w.id !== id))
}

export async function reorderClientWork(id, direction) {
  await mutateJson(PATH, (existing) => {
    const list = existing || []
    const index = list.findIndex((w) => w.id === id)
    if (index === -1) return list
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (swapWith < 0 || swapWith >= list.length) return list
    const next = [...list]
    ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
    return next
  })
}
