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

// encodeURIComponent leaves '.' unescaped, which would break the token's
// dot-delimited format if an admin's name happened to contain one — the
// extra replace closes that gap. Deliberately not base64 (via Buffer),
// which isn't guaranteed available in the Edge runtime proxy.js runs in;
// encodeURIComponent/decodeURIComponent are.
function encodeName(name) {
  return encodeURIComponent(name || 'Owner').replace(/\./g, '%2E')
}
function decodeName(encoded) {
  try {
    return decodeURIComponent(encoded)
  } catch {
    return 'Owner'
  }
}

// The token carries its own issued-at timestamp and the signed-in admin's
// name, and is signed over both, so (a) every login produces a genuinely
// different token instead of the same signature forever, (b) expiry is
// enforced here, server-side, rather than relying only on the cookie's own
// maxAge — which a copied/replayed cookie value would simply ignore — and
// (c) AdminNav can show "Signed in as ___" straight from the cookie, no
// extra lookup needed.
export async function createSessionToken(name) {
  const issuedAt = Date.now()
  const encodedName = encodeName(name)
  const signature = await hmac(`ok.${issuedAt}.${encodedName}`)
  return `ok.${issuedAt}.${encodedName}.${signature}`
}

export async function isValidSessionToken(token) {
  if (!token) return false
  const [value, issuedAtRaw, encodedName, signature] = token.split('.')
  if (value !== 'ok' || !issuedAtRaw || !encodedName || !signature) return false

  const issuedAt = Number(issuedAtRaw)
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_MAX_AGE_MS) return false

  const expected = await hmac(`ok.${issuedAtRaw}.${encodedName}`)
  return expected === signature
}

export async function getSessionAdminName(token) {
  if (!(await isValidSessionToken(token))) return null
  const encodedName = token.split('.')[2]
  return decodeName(encodedName)
}
