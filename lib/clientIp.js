import { headers } from 'next/headers'

// Shared by anything that needs to bucket requests per-visitor (login
// lockout, inquiry-form rate limiting) — Vercel sits in front of every
// request, so the real client address only ever arrives via this header.
export async function clientIp() {
  const headerList = await headers()
  return headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
}
