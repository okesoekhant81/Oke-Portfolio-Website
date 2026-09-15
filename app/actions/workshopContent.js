'use server'

import { revalidatePath } from 'next/cache'
import { saveWorkshopContent } from '../../lib/content/workshop'
import { logActivity } from '../../lib/activityLog'

export async function saveWorkshop(prevState, formData) {
  const get = (name) => formData.get(name)?.toString() ?? ''

  const modules = [0, 1, 2, 3].map((i) => ({
    title: get(`module-${i}-title`),
    titleMy: get(`module-${i}-titleMy`),
    lessons: get(`module-${i}-lessons`),
    lessonsMy: get(`module-${i}-lessonsMy`),
  }))

  const faqs = [0, 1, 2, 3, 4, 5].map((i) => ({
    question: get(`faq-${i}-question`),
    questionMy: get(`faq-${i}-questionMy`),
    answer: get(`faq-${i}-answer`),
    answerMy: get(`faq-${i}-answerMy`),
  }))

  // Stored as fixed slots same as modules/faqs above — a blank name means
  // "not filled in", filtered out wherever this is displayed (see
  // RegistrationForm.jsx) rather than here, so a half-filled slot doesn't
  // just silently vanish the next time the admin opens this form.
  const paymentMethods = [0, 1, 2, 3].map((i) => ({
    name: get(`payment-${i}-name`),
    nameMy: get(`payment-${i}-nameMy`),
    accountName: get(`payment-${i}-accountName`),
    accountNumber: get(`payment-${i}-accountNumber`),
    qrImage: get(`payment-${i}-qrImage`),
    note: get(`payment-${i}-note`),
    noteMy: get(`payment-${i}-noteMy`),
  }))

  const data = {
    heroImage: get('heroImage'),
    heroTitle: get('heroTitle'),
    heroTitleMy: get('heroTitleMy'),
    heroSubtitle: get('heroSubtitle'),
    heroSubtitleMy: get('heroSubtitleMy'),
    intro: get('intro'),
    introMy: get('introMy'),

    formatLabel: get('formatLabel'),
    formatLabelMy: get('formatLabelMy'),
    format: get('format'),
    formatMy: get('formatMy'),
    durationLabel: get('durationLabel'),
    durationLabelMy: get('durationLabelMy'),
    duration: get('duration'),
    durationMy: get('durationMy'),
    audienceLabel: get('audienceLabel'),
    audienceLabelMy: get('audienceLabelMy'),
    audience: get('audience'),
    audienceMy: get('audienceMy'),

    priceLabel: get('priceLabel'),
    priceLabelMy: get('priceLabelMy'),
    price: get('price'),
    priceMy: get('priceMy'),
    promoPrice: get('promoPrice'),
    promoPriceMy: get('promoPriceMy'),

    outlineHeading: get('outlineHeading'),
    outlineHeadingMy: get('outlineHeadingMy'),
    modules,

    ctaHeading: get('ctaHeading'),
    ctaHeadingMy: get('ctaHeadingMy'),
    ctaBody: get('ctaBody'),
    ctaBodyMy: get('ctaBodyMy'),

    faqHeading: get('faqHeading'),
    faqHeadingMy: get('faqHeadingMy'),
    faqs,

    paymentMethods,

    sessionPlatform: get('sessionPlatform'),
    sessionPlatformMy: get('sessionPlatformMy'),
    sessionLanguage: get('sessionLanguage'),
    sessionLanguageMy: get('sessionLanguageMy'),

    paymentConfirmedSubject: get('paymentConfirmedSubject'),
    paymentConfirmedSubjectMy: get('paymentConfirmedSubjectMy'),
    paymentConfirmedBody: get('paymentConfirmedBody'),
    paymentConfirmedBodyMy: get('paymentConfirmedBodyMy'),
    paymentConfirmedSignature: get('paymentConfirmedSignature'),
    paymentConfirmedSignatureMy: get('paymentConfirmedSignatureMy'),

    certificateLogo: get('certificateLogo'),
  }

  try {
    await saveWorkshopContent(data)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  await logActivity('Workshop content saved')
  revalidatePath('/workshop')
  revalidatePath('/admin/workshop')

  return { success: true, savedAt: Date.now() }
}
