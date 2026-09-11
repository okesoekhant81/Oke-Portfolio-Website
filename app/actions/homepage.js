'use server'

import { revalidatePath } from 'next/cache'
import { saveHomepageContent } from '../../lib/content/homepage'

export async function saveHomepage(prevState, formData) {
  const get = (name) => formData.get(name)?.toString() ?? ''

  const services = [0, 1, 2, 3].map((i) => ({
    title: get(`service-${i}-title`),
    copy: get(`service-${i}-copy`),
    image: get(`service-${i}-image`),
  }))

  const projects = [0, 1].map((i) => ({
    name: get(`project-${i}-name`),
    location: get(`project-${i}-location`),
    description: get(`project-${i}-description`),
    role: get(`project-${i}-role`),
    logo: get(`project-${i}-logo`),
  }))

  const data = {
    heroName: get('heroName'),
    heroBody: get('heroBody'),
    heroBadgePrefix: get('heroBadgePrefix'),
    heroBadgeEmphasis: get('heroBadgeEmphasis'),
    heroImage: get('heroImage'),

    marketingLine1: get('marketingLine1'),
    marketingLine2: get('marketingLine2'),
    marketingBody: get('marketingBody'),

    services,

    strategyLine1: get('strategyLine1'),
    strategyLine2: get('strategyLine2'),
    strategyParagraph: get('strategyParagraph'),
    strategyQuote: get('strategyQuote'),

    buildingLine1: get('buildingLine1'),
    buildingLine2: get('buildingLine2'),
    buildingIntro: get('buildingIntro'),
    buildingEmphasis: get('buildingEmphasis'),
    projects,

    workshopImage: get('workshopImage'),
    workshopLine1: get('workshopLine1'),
    workshopLine2: get('workshopLine2'),
    workshopBody: get('workshopBody'),
    workshopRole: get('workshopRole'),

    aboutLine1: get('aboutLine1'),
    aboutLine2: get('aboutLine2'),
    aboutBody: get('aboutBody'),

    contactLine1: get('contactLine1'),
    contactLine2: get('contactLine2'),
    contactBody: get('contactBody'),
    contactCta: get('contactCta'),
    contactEmail: get('contactEmail'),
    contactCopyright: get('contactCopyright'),
    contactTagline: get('contactTagline'),
  }

  try {
    await saveHomepageContent(data)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }

  revalidatePath('/')
  revalidatePath('/admin/homepage')

  return { success: true, savedAt: Date.now() }
}
