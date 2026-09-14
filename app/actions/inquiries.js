'use server'

import { revalidatePath } from 'next/cache'
import { addInquiry, deleteInquiry, deleteInquiries, setInquiryStatus, setInquiriesStatus } from '../../lib/content/inquiries'
import { getClassDates } from '../../lib/content/classDates'
import { getStudents } from '../../lib/content/students'
import { checkSubmissionLimit, recordSubmission } from '../../lib/submissionLimits'
import { clientIp } from '../../lib/clientIp'
import { notifyNewInquiry } from '../../lib/notify'
import { sendRegistrationConfirmation } from '../../lib/registrantEmail'
import { logActivity } from '../../lib/activityLog'
import { getLocale } from '../../lib/i18n'

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
  if (classDate) {
    // The registration form only ever offers 'upcoming' dates as options,
    // but that's a client-side filter — re-checked here since nothing
    // stops a request from naming an in-progress or completed class
    // directly. Missing/legacy status is treated as upcoming (open),
    // same fallback used everywhere else a class's status is shown.
    const matchedClass = (await getClassDates()).find((d) => d.date === classDate)
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

  const locale = await getLocale()

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
    })
  } catch (err) {
    return { error: err.message || 'Could not submit. Please try again.' }
  }

  await notifyNewInquiry(record)
  await sendRegistrationConfirmation(record, locale)
  revalidatePath('/admin/inquiries')
  return { success: true, waitlisted }
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

export async function deleteInquiryAction(formData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await deleteInquiry(id)
  await logActivity('Inquiry deleted', id)
  revalidatePath('/admin/inquiries')
}

export async function bulkDeleteInquiriesAction(formData) {
  const ids = formData.getAll('id').map((v) => v.toString())
  if (ids.length === 0) return

  await deleteInquiries(ids)
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
