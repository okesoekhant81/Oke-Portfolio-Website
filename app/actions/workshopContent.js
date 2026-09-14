'use server'

import { revalidatePath } from 'next/cache'
import { saveWorkshopContent } from '../../lib/content/workshop'

export async function saveWorkshop(prevState, formData) {
  const get = (name) => formData.get(name)?.toString() ?? ''

  const modules = [0, 1, 2, 3].map((i) => ({
    title: get(`module-${i}-title`),
    titleMy: get(`module-${i}-titleMy`),
    lessons: get(`module-${i}-lessons`),
    lessonsMy: get(`module-${i}-lessonsMy`),
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

    outlineHeading: get('outlineHeading'),
    outlineHeadingMy: get('outlineHeadingMy'),
    modules,

    ctaHeading: get('ctaHeading'),
    ctaHeadingMy: get('ctaHeadingMy'),
    ctaBody: get('ctaBody'),
    ctaBodyMy: get('ctaBodyMy'),
  }

  try {
    await saveWorkshopContent(data)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  revalidatePath('/workshop')
  revalidatePath('/admin/workshop')

  return { success: true, savedAt: Date.now() }
}
