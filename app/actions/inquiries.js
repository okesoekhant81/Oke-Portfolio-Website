'use server'

import { revalidatePath } from 'next/cache'
import { headers, cookies } from 'next/headers'
import {
  addInquiry,
  deleteInquiry,
  deleteInquiries,
  setInquiryStatus,
  setInquiriesStatus,
  getInquiriesFingerprint,
  getInquiry,
  getInquiries,
} from '../../lib/content/inquiries'
import { cleanupAllImages } from '../../lib/imageCleanup'
import { getClassDates } from '../../lib/content/classDates'
import { getStudents } from '../../lib/content/students'
import { getWorkshopContent } from '../../lib/content/workshop'
import { checkSubmissionLimit, recordSubmission } from '../../lib/submissionLimits'
import { clientIp } from '../../lib/clientIp'
import { notifyNewInquiry } from '../../lib/notify'
import { logActivity } from '../../lib/activityLog'
import { getLocale } from '../../lib/i18n'
import { sendMetaCapiEvent } from '../../lib/metaCapi'
import { SITE_URL } from '../../lib/site'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// A real visitor moves through several steps (mount, then at least 3 clicks
// to reach submit) — even with browser autofill doing the typing, that's
// not physically doable in under this long. Anything faster skipped the UI
// entirely, i.e. a script posting straight at the action.
const MIN_FILL_MS = 600

const MAX_LENGTHS = { name: 200, email: 200, phone: 60, business: 200, role: 120, message: 4000, classDate: 20, hearAbout: 20 }

// Public — reachable from the unauthenticated /workshop registration form,
// so it validates its own input rather than trusting the client, and
// carries its own bot/abuse defenses since nothing upstream of a Server
// Action gates who can call it:
//  - a honeypot field real users never see, so anything filling it is a
//    bot that fills every input it can find in the DOM
//  - a minimum time-since-mount, so instant scripted POSTs get caught too
//  - a per-IP submission cap, so anything that slips past both is still
//    limited in how much it can write
// Both bot signals return a fake success rather than an error, so a bot
// gets no feedback to adjust its behavior on — but nothing is persisted
// and the attempt isn't charged against the IP's rate limit.
export async function submitInquiryAction(prevState, formData) {
  const get = (name) => formData.get(name)?.toString().trim() ?? ''

  if (get('website')) return { success: true }

  const startedAt = Number(get('formStartedAt'))
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) return { success: true }

  const ip = await clientIp()
  const { limited, retryAfterSeconds } = await checkSubmissionLimit('inquiry-submissions', ip)
  if (limited) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    return { error: `Too many submissions. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
  }
  await recordSubmission('inquiry-submissions', ip)

  const name = get('name').slice(0, MAX_LENGTHS.name)
  const email = get('email').slice(0, MAX_LENGTHS.email)
  const phone = get('phone').slice(0, MAX_LENGTHS.phone)

  if (!name) return { error: 'Please enter your name.' }
  if (!email || !EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }
  if (!phone) return { error: 'Please enter your phone number.' }

  const classDate = get('classDate').slice(0, MAX_LENGTHS.classDate)
  // Recomputed here rather than trusted from the client — the form guesses
  // at isFull from whatever headcount it rendered with, which can already
  // be stale by the time this submission lands.
  let waitlisted = false
  // Hoisted out of the `if (classDate)` block below — also used after it to
  // give the CompleteRegistration Pixel/CAPI events below a real course
  // price instead of a guess.
  let matchedClass = null
  if (classDate) {
    // The registration form only ever offers 'upcoming' dates as options,
    // but that's a client-side filter — re-checked here since nothing
    // stops a request from naming an in-progress or completed class
    // directly. Missing/legacy status is treated as upcoming (open),
    // same fallback used everywhere else a class's status is shown.
    matchedClass = (await getClassDates()).find((d) => d.date === classDate)
    if (matchedClass && matchedClass.status && matchedClass.status !== 'upcoming') {
      return { error: 'That class is no longer open for registration. Please choose another date.' }
    }
    if (matchedClass?.capacity) {
      const registered = (await getStudents()).filter((s) => s.classDate === classDate).length
      waitlisted = registered >= matchedClass.capacity
    }
  }

  // Only ever a URL our own upload endpoint just generated (a Blob URL) —
  // trusted as a plain string this far, but a client could still put any
  // text in the hidden field, so anything other than a real https:// URL
  // is dropped rather than stored and later rendered as a link in admin.
  const paymentProofUrlRaw = get('paymentProofUrl')
  const paymentProofUrl = paymentProofUrlRaw.startsWith('https://') ? paymentProofUrlRaw.slice(0, 500) : ''

  // Re-checked here rather than trusted from the client, same reasoning as
  // the capacity/waitlist check above — not required for a waitlist entry,
  // since that isn't a confirmed seat yet.
  if (!waitlisted) {
    const workshop = await getWorkshopContent()
    const paymentRequired = workshop.paymentMethods.some((m) => m.name)
    if (paymentRequired && !paymentProofUrl) {
      return { error: 'Please upload your payment screenshot before submitting.' }
    }
  }

  const locale = await getLocale()

  // Captured now (set by the Pixel base script once consent is accepted —
  // see components/MetaPixel.jsx) and carried on the record through
  // conversion to a student, so the admin-verified Purchase event fired
  // later from updateStudentPaymentAction can still attribute back to the
  // same ad click/session, not just this registration.
  const cookieStore = await cookies()
  const fbp = cookieStore.get('_fbp')?.value || ''
  const fbc = cookieStore.get('_fbc')?.value || ''

  let record
  try {
    record = await addInquiry({
      name,
      email,
      phone,
      business: get('business').slice(0, MAX_LENGTHS.business),
      role: get('role').slice(0, MAX_LENGTHS.role),
      participants: get('participants'),
      classDate,
      hearAbout: get('hearAbout').slice(0, MAX_LENGTHS.hearAbout),
      message: get('message').slice(0, MAX_LENGTHS.message),
      locale,
      waitlisted,
      paymentProofUrl,
      fbp,
      fbc,
    })
  } catch (err) {
    return { error: err.message || 'Could not submit. Please try again.' }
  }

  // No confirmation email yet — that's sent once the admin actually marks
  // payment as received (see updateStudentPaymentAction), not just because
  // the form was submitted. This is only the admin-facing "someone
  // registered, go check" ping.
  await notifyNewInquiry(record)

  // CompleteRegistration: fired from both the browser Pixel (see
  // RegistrationForm.jsx, once state.success comes back) and here,
  // server-side via CAPI — the same record.id as event_id on both sides is
  // what lets Meta dedup them into a single event instead of double
  // counting. The server side alone also covers visitors who declined
  // cookies or run an ad/tracker blocker, which the browser Pixel can't.
  // Purchase is deliberately NOT fired here — see updateStudentPaymentAction
  // for why (this is a submission, not a confirmed payment).
  const headerList = await headers()
  const eventSourceUrl = headerList.get('referer') || `${SITE_URL}/workshop`
  await sendMetaCapiEvent({
    eventName: 'CompleteRegistration',
    eventId: record.id,
    eventSourceUrl,
    email,
    phone,
    externalId: record.id,
    clientIp: ip,
    userAgent: headerList.get('user-agent') || '',
    fbp,
    fbc,
    customData: matchedClass?.defaultFee ? { value: matchedClass.defaultFee, currency: 'MMK' } : undefined,
  })

  revalidatePath('/admin/inquiries')
  return {
    success: true,
    waitlisted,
    registrationId: record.id.toUpperCase(),
    // Handed to RegistrationForm.jsx so its browser-side fbq('track', ...)
    // call can match the server event above exactly.
    metaEventId: record.id,
    metaValue: matchedClass?.defaultFee || undefined,
  }
}

// Callable directly from AutoRefresh (a client component) rather than
// through a form — same as any other Server Action, just invoked on a
// timer instead of a click. Only reachable from /admin/inquiries, gated by
// proxy.js like everything else here.
export async function getInquiriesFingerprintAction() {
  return getInquiriesFingerprint()
}

// Both of the below rely on only being reachable through a form on
// /admin/inquiries, which proxy.js gates — same pattern as deletePostAction.
export async function updateInquiryStatusAction(formData) {
  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString()
  if (!id || !status) return

  await setInquiryStatus(id, status)
  revalidatePath('/admin/inquiries')
}

// The only delete path for inquiries — there's no Trash step for these like
// there is for students/posts/testimonials, so every delete here is already
// permanent and any payment screenshot it references needs cleaning up now,
// not behind a separate "permanent delete" action.
export async function deleteInquiryAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  const inquiry = await getInquiry(id)
  await deleteInquiry(id)
  if (inquiry) await cleanupAllImages(inquiry)
  await logActivity('Inquiry deleted', id)
  revalidatePath('/admin/inquiries')
}

export async function bulkDeleteInquiriesAction(formData) {
  const ids = formData.getAll('id').map((v) => v.toString())
  if (ids.length === 0) return

  const idSet = new Set(ids)
  const inquiries = (await getInquiries()).filter((inq) => idSet.has(inq.id))
  await deleteInquiries(ids)
  await cleanupAllImages(inquiries)
  await logActivity('Inquiries bulk-deleted', `${ids.length} inquiries`)
  revalidatePath('/admin/inquiries')
}

export async function bulkSetInquiryStatusAction(formData) {
  const ids = formData.getAll('id').map((v) => v.toString())
  const status = formData.get('status')?.toString()
  if (ids.length === 0 || !status) return

  await setInquiriesStatus(ids, status)
  revalidatePath('/admin/inquiries')
}
