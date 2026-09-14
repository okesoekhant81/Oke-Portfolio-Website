'use server'

import { revalidatePath } from 'next/cache'
import { addInquiry, deleteInquiry, setInquiryStatus } from '../../lib/content/inquiries'
import { checkSubmissionLimit, recordSubmission } from '../../lib/submissionLimits'
import { clientIp } from '../../lib/clientIp'

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
  const { limited, retryAfterSeconds } = await checkSubmissionLimit(ip)
  if (limited) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    return { error: `Too many submissions. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
  }
  await recordSubmission(ip)

  const name = get('name').slice(0, MAX_LENGTHS.name)
  const email = get('email').slice(0, MAX_LENGTHS.email)
  const phone = get('phone').slice(0, MAX_LENGTHS.phone)

  if (!name) return { error: 'Please enter your name.' }
  if (!email || !EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }
  if (!phone) return { error: 'Please enter your phone number.' }

  try {
    await addInquiry({
      name,
      email,
      phone,
      business: get('business').slice(0, MAX_LENGTHS.business),
      role: get('role').slice(0, MAX_LENGTHS.role),
      participants: get('participants'),
      classDate: get('classDate').slice(0, MAX_LENGTHS.classDate),
      hearAbout: get('hearAbout').slice(0, MAX_LENGTHS.hearAbout),
      message: get('message').slice(0, MAX_LENGTHS.message),
    })
  } catch (err) {
    return { error: err.message || 'Could not submit. Please try again.' }
  }

  return { success: true }
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
  revalidatePath('/admin/inquiries')
}
