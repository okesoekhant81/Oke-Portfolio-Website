import { createHash } from 'crypto'
import { META_PIXEL_ID } from './site'

// Server-only: sends events to Meta's Conversions API. Never import this
// from a 'use client' file — META_CAPI_ACCESS_TOKEN would end up in the
// browser bundle if it did. The browser Pixel (components/MetaPixel.jsx)
// only ever sees META_PIXEL_ID, which is public by design (see lib/site.js).
const CAPI_URL = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

// Meta requires em/ph hashed as: trimmed, lowercased (email) or digits-only
// (phone, with country code, no leading '+' or '0' trunk prefix) before
// SHA-256. Real-world phone formats vary too much to fully normalize here,
// so this only strips non-digits — an imperfect match still counts toward
// Event Match Quality, it just isn't guaranteed to hit 100%.
function hashEmail(email) {
  const trimmed = email?.trim().toLowerCase()
  return trimmed ? sha256(trimmed) : null
}

function hashPhone(phone) {
  const digits = phone?.replace(/\D/g, '')
  return digits ? sha256(digits) : null
}

// Fields the caller doesn't have (no fbp cookie yet, no client IP for an
// admin-triggered event, ...) are simply omitted — Meta's docs are explicit
// that a null/empty value in user_data hurts match quality more than not
// sending the key at all.
function buildUserData({ email, phone, externalId, clientIp, userAgent, fbp, fbc }) {
  const userData = {}
  const em = hashEmail(email)
  const ph = hashPhone(phone)
  if (em) userData.em = [em]
  if (ph) userData.ph = [ph]
  if (externalId) userData.external_id = [sha256(String(externalId))]
  if (clientIp && clientIp !== 'unknown') userData.client_ip_address = clientIp
  if (userAgent) userData.client_user_agent = userAgent
  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc
  return userData
}

// Silently no-ops until both env vars are set — same "missing config just
// means this feature is off" pattern as email (lib/email.js) and Blob
// (lib/blobStore.js), rather than throwing from a code path (registration,
// payment confirmation) that has to keep working either way.
//
// eventId is the caller's job to make stable/unique — CompleteRegistration
// reuses the same id the browser Pixel fires with (for dedup), Purchase
// uses one derived from the student id (so re-saving an already-paid
// student, which never re-enters this call site, can't double-fire it).
export async function sendMetaCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  actionSource = 'website',
  email,
  phone,
  externalId,
  clientIp,
  userAgent,
  fbp,
  fbc,
  customData,
}) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  if (!accessToken) return

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: actionSource,
    user_data: buildUserData({ email, phone, externalId, clientIp, userAgent, fbp, fbc }),
  }
  if (eventSourceUrl) event.event_source_url = eventSourceUrl
  if (customData && Object.keys(customData).length > 0) event.custom_data = customData

  const payload = { data: [event], access_token: accessToken }
  // Set META_TEST_EVENT_CODE (from Meta's Test Events tab) while verifying
  // in production, then unset it — events sent with a test code show up in
  // the Test Events panel instead of counting toward real ad optimization.
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE

  try {
    const res = await fetch(CAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('Meta CAPI event failed:', eventName, res.status, await res.text())
    }
  } catch (err) {
    console.error('Meta CAPI request failed:', eventName, err)
  }
}
