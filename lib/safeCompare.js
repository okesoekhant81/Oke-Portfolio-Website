import { createHash, timingSafeEqual } from 'crypto'

// A plain `===` on secrets (a password, a bearer token) leaks how many
// leading characters matched through how long the comparison took —
// exploitable over enough repeated attempts even across a network, given
// patience. Hashing both sides to a fixed-length digest first means
// timingSafeEqual never sees the original lengths (or throws on a length
// mismatch, which would itself leak that the length was wrong) and never
// short-circuits on the first differing byte.
export function safeStringEqual(a, b) {
  const aHash = createHash('sha256').update(String(a ?? '')).digest()
  const bHash = createHash('sha256').update(String(b ?? '')).digest()
  return timingSafeEqual(aHash, bHash)
}
