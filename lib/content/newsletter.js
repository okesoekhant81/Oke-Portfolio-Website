import { readJson, mutateJson, isBlobConfigured } from '../blobStore'

const PATH = 'content/newsletter-subscribers.json'

export async function getSubscribers() {
  if (!isBlobConfigured) return []
  const subscribers = await readJson(PATH)
  return subscribers || []
}

// Silently no-ops on a duplicate email rather than erroring — someone
// submitting the form twice (double-click, or genuinely re-subscribing)
// should just see the same success state either time, not a "you're
// already on the list" error that leaks whether an address is registered.
export async function addSubscriber(email) {
  const normalized = email.trim().toLowerCase()
  await mutateJson(PATH, (existing) => {
    const list = existing || []
    if (list.some((s) => s.email === normalized)) return list
    return [...list, { email: normalized, subscribedAt: new Date().toISOString() }]
  })
}

export async function deleteSubscriber(email) {
  const normalized = email.trim().toLowerCase()
  await mutateJson(PATH, (existing) => (existing || []).filter((s) => s.email !== normalized))
}
