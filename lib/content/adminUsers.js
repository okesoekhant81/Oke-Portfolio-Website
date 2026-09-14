import { readJson, mutateJson, isBlobConfigured } from '../blobStore'
import { hashPassword, verifyPassword } from '../passwordHash'

const PATH = 'content/admin-users.json'

// Returned to the Team page — never includes passwordHash.
function toPublic(user) {
  const { passwordHash: _passwordHash, ...rest } = user
  return rest
}

export async function getAdminUsers() {
  if (!isBlobConfigured) return []
  const users = await readJson(PATH)
  return (users || []).map(toPublic)
}

export async function addAdminUser({ name, email, password }) {
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  await mutateJson(PATH, (existing) => {
    const list = existing || []
    if (list.some((u) => u.email === record.email)) {
      throw new Error('An admin with that email already exists.')
    }
    return [...list, record]
  })
  return toPublic(record)
}

export async function deleteAdminUser(id) {
  await mutateJson(PATH, (existing) => (existing || []).filter((u) => u.id !== id))
}

// Returns the matching user (without passwordHash) on success, or null —
// ADMIN_PASSWORD is checked separately by the login action itself, this is
// only ever the named-team-member path.
export async function verifyAdminCredentials(email, password) {
  if (!isBlobConfigured || !email || !password) return null
  const users = (await readJson(PATH)) || []
  const user = users.find((u) => u.email === email.toLowerCase())
  if (!user || !verifyPassword(password, user.passwordHash)) return null
  return toPublic(user)
}
