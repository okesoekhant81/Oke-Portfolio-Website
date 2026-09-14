'use server'

import { revalidatePath } from 'next/cache'
import { saveAboutContent } from '../../lib/content/about'

export async function saveAbout(prevState, formData) {
  const get = (name) => formData.get(name)?.toString() ?? ''

  const stats = [0, 1, 2, 3].map((i) => ({
    value: get(`stat-${i}-value`),
    label: get(`stat-${i}-label`),
    labelMy: get(`stat-${i}-labelMy`),
  }))

  const experience = [0, 1, 2, 3].map((i) => ({
    role: get(`exp-${i}-role`),
    roleMy: get(`exp-${i}-roleMy`),
    company: get(`exp-${i}-company`),
    period: get(`exp-${i}-period`),
    location: get(`exp-${i}-location`),
    achievement: get(`exp-${i}-achievement`),
    achievementMy: get(`exp-${i}-achievementMy`),
  }))

  const data = {
    heroTitle: get('heroTitle'),
    heroTitleMy: get('heroTitleMy'),
    heroSubtitle: get('heroSubtitle'),
    heroSubtitleMy: get('heroSubtitleMy'),
    roleLine: get('roleLine'),
    roleLineMy: get('roleLineMy'),
    intro: get('intro'),
    introMy: get('introMy'),
    stats,
    experienceHeading: get('experienceHeading'),
    experienceHeadingMy: get('experienceHeadingMy'),
    experience,
    skillsHeading: get('skillsHeading'),
    skillsHeadingMy: get('skillsHeadingMy'),
    skills: get('skills'),
    skillsMy: get('skillsMy'),
  }

  try {
    await saveAboutContent(data)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  revalidatePath('/about')
  revalidatePath('/admin/about')

  return { success: true, savedAt: Date.now() }
}
