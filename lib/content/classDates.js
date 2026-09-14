import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

const PATH = 'content/workshop-dates.json'

// getClassDates is read by the public /workshop page (to populate the
// registration form's date select) as well as /admin/workshop — everything
// else here relies on only being reachable through the admin form, same as
// saveWorkshopContent. add/delete use mutateJson (ETag compare-and-swap,
// see lib/blobStore.js) rather than a plain read-then-write, since adding
// one date while deleting another in the same admin session — or in two
// tabs — is a plain read-then-write's classic lost-update scenario.
export async function getClassDates() {
  if (!isBlobConfigured) return []
  const dates = await readJson(PATH)
  return dates || []
}

export async function addClassDate({ date, label }) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    label,
    // Manually set, not derived from today's date vs. `date` — a workshop
    // can run across several days, so a pure date comparison would call a
    // class "completed" while it's still actually running.
    status: 'upcoming',
  }
  // Soonest first, both here and wherever this list is read for the form's
  // <select> options.
  await mutateJson(PATH, (existing) => [...(existing || []), record].sort((a, b) => a.date.localeCompare(b.date)))
  return record
}

export async function updateClassDate(id, patch) {
  await mutateJson(PATH, (existing) => (existing || []).map((d) => (d.id === id ? { ...d, ...patch } : d)))
}

export async function deleteClassDate(id) {
  await mutateJson(PATH, (existing) => (existing || []).filter((d) => d.id !== id))
}

export async function getClassDate(id) {
  const dates = await getClassDates()
  return dates.find((d) => d.id === id) || null
}
