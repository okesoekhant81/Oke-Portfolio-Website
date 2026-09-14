'use server'

import { revalidatePath } from 'next/cache'
import { addSubscriber, deleteSubscriber } from '../../lib/content/newsletter'
import { checkSubmissionLimit, recordSubmission } from '../../lib/submissionLimits'
import { clientIp } from '../../lib/clientIp'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_FILL_MS = 600

// Public — reachable from the Contact section on every page. Same bot/abuse
// defenses as submitInquiryAction: honeypot, minimum fill time, per-IP rate
// limit (own bucket, separate from the workshop form's).
export async function subscribeNewsletterAction(prevState, formData) {
  const get = (name) => formData.get(name)?.toString().trim() ?? ''

  if (get('website')) return { success: true }

  const startedAt = Number(get('formStartedAt'))
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) return { success: true }

  const email = get('email')
  if (!email || !EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' }

  const ip = await clientIp()
  const { limited, retryAfterSeconds } = await checkSubmissionLimit('newsletter-submissions', ip)
  if (limited) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    return { error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
  }
  await recordSubmission('newsletter-submissions', ip)

  try {
    await addSubscriber(email.slice(0, 200))
  } catch (err) {
    return { error: err.message || 'Could not subscribe. Please try again.' }
  }

  revalidatePath('/admin/subscribers')
  return { success: true }
}

export async function deleteSubscriberAction(formData) {
  const email = formData.get('email')?.toString()
  if (!email) return

  await deleteSubscriber(email)
  revalidatePath('/admin/subscribers')
}
