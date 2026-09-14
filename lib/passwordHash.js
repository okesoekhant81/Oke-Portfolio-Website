import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

// Node's crypto module, not Web Crypto — this is only ever called from
// Server Actions (Node runtime), never from proxy.js (Edge runtime, see
// lib/auth.js's own Web-Crypto-only comment for why that one's different).
// scrypt over bcrypt/argon2 since it needs no extra package, same reasoning
// used throughout lib/notify.js and lib/email.js.
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':')
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, 'hex')
  const candidate = scryptSync(password, salt, 64)
  // timingSafeEqual throws on length mismatch rather than returning false —
  // a tampered/corrupt stored hash shouldn't crash the login attempt, it
  // should just fail it.
  if (hashBuffer.length !== candidate.length) return false
  return timingSafeEqual(hashBuffer, candidate)
}
