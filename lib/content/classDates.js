import { readJson, writeJson, isBlobConfigured } from '../blobStore'

const PATH = 'content/workshop-dates.json'

// getClassDates is read by the public /workshop page (to populate the
// registration form's date select) as well as /admin/workshop — everything
// else here relies on only being reachable through the admin form, same as
// saveWorkshopContent.
export async function getClassDates() {
  if (!isBlobConfigured) return []
  const dates = await readJson(PATH)
  return dates || []
}

export async function addClassDate({ date, label }) {
  if (!isBlobConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel Blob store first.')
  }
  const existing = (await readJson(PATH)) || []
  const record = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, date, label }
  // Soonest first, both here and wherever this list is read for the form's
  // <select> options.
  const next = [...existing, record].sort((a, b) => a.date.localeCompare(b.date))
  await writeJson(PATH, next)
  return record
}

export async function deleteClassDate(id) {
  const existing = (await readJson(PATH)) || []
  await writeJson(
    PATH,
    existing.filter((d) => d.id !== id)
  )
}
