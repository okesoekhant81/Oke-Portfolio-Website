// Uses Web Crypto (globalThis.crypto.subtle) rather than Node's crypto
// module so the same code runs in both middleware (Edge runtime) and
// Server Actions (Node runtime).

export const SESSION_COOKIE = 'admin_session'
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

async function hmac(value) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-only-insecure-secret'
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// The token carries its own issued-at timestamp and is signed over it, so
// (a) every login produces a genuinely different token instead of the same
// signature forever, and (b) expiry is enforced here, server-side, rather
// than relying only on the cookie's own maxAge — which a copied/replayed
// cookie value would simply ignore.
export async function createSessionToken() {
  const issuedAt = Date.now()
  const signature = await hmac(`ok.${issuedAt}`)
  return `ok.${issuedAt}.${signature}`
}

export async function isValidSessionToken(token) {
  if (!token) return false
  const [value, issuedAtRaw, signature] = token.split('.')
  if (value !== 'ok' || !issuedAtRaw || !signature) return false

  const issuedAt = Number(issuedAtRaw)
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_MAX_AGE_MS) return false

  const expected = await hmac(`ok.${issuedAtRaw}`)
  return expected === signature
}
