// Uses Web Crypto (globalThis.crypto.subtle) rather than Node's crypto
// module so the same code runs in both middleware (Edge runtime) and
// Server Actions (Node runtime).

export const SESSION_COOKIE = 'admin_session'

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

export async function createSessionToken() {
  const signature = await hmac('ok')
  return `ok.${signature}`
}

export async function isValidSessionToken(token) {
  if (!token) return false
  const [value, signature] = token.split('.')
  if (value !== 'ok' || !signature) return false
  const expected = await hmac('ok')
  return expected === signature
}
