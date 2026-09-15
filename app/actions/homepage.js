'use server'

import { revalidatePath } from 'next/cache'
import { saveHomepageContent, getHomepageContent } from '../../lib/content/homepage'
import { cleanupReplacedImages } from '../../lib/imageCleanup'
import { logActivity } from '../../lib/activityLog'

export async function saveHomepage(prevState, formData) {
  const get = (name) => formData.get(name)?.toString() ?? ''

  const services = [0, 1, 2, 3].map((i) => ({
    title: get(`service-${i}-title`),
    titleMy: get(`service-${i}-titleMy`),
    copy: get(`service-${i}-copy`),
    copyMy: get(`service-${i}-copyMy`),
    image: get(`service-${i}-image`),
  }))

  const projects = [0, 1].map((i) => ({
    name: get(`project-${i}-name`),
    location: get(`project-${i}-location`),
    locationMy: get(`project-${i}-locationMy`),
    description: get(`project-${i}-description`),
    descriptionMy: get(`project-${i}-descriptionMy`),
    role: get(`project-${i}-role`),
    roleMy: get(`project-${i}-roleMy`),
    logo: get(`project-${i}-logo`),
  }))

  const data = {
    heroName: get('heroName'),
    heroBody: get('heroBody'),
    heroBodyMy: get('heroBodyMy'),
    heroBadgePrefix: get('heroBadgePrefix'),
    heroBadgePrefixMy: get('heroBadgePrefixMy'),
    heroBadgeEmphasis: get('heroBadgeEmphasis'),
    heroBadgeEmphasisMy: get('heroBadgeEmphasisMy'),
    heroImage: get('heroImage'),

    marketingLine1: get('marketingLine1'),
    marketingLine1My: get('marketingLine1My'),
    marketingLine2: get('marketingLine2'),
    marketingLine2My: get('marketingLine2My'),
    marketingBody: get('marketingBody'),
    marketingBodyMy: get('marketingBodyMy'),

    services,

    strategyLine1: get('strategyLine1'),
    strategyLine1My: get('strategyLine1My'),
    strategyLine2: get('strategyLine2'),
    strategyLine2My: get('strategyLine2My'),
    strategyParagraph: get('strategyParagraph'),
    strategyParagraphMy: get('strategyParagraphMy'),
    strategyQuote: get('strategyQuote'),
    strategyQuoteMy: get('strategyQuoteMy'),

    buildingLine1: get('buildingLine1'),
    buildingLine1My: get('buildingLine1My'),
    buildingLine2: get('buildingLine2'),
    buildingLine2My: get('buildingLine2My'),
    buildingIntro: get('buildingIntro'),
    buildingIntroMy: get('buildingIntroMy'),
    buildingEmphasis: get('buildingEmphasis'),
    buildingEmphasisMy: get('buildingEmphasisMy'),
    projects,

    workshopImage: get('workshopImage'),
    workshopLine1: get('workshopLine1'),
    workshopLine1My: get('workshopLine1My'),
    workshopLine2: get('workshopLine2'),
    workshopLine2My: get('workshopLine2My'),
    workshopBody: get('workshopBody'),
    workshopBodyMy: get('workshopBodyMy'),
    workshopRole: get('workshopRole'),
    workshopRoleMy: get('workshopRoleMy'),

    aboutLine1: get('aboutLine1'),
    aboutLine1My: get('aboutLine1My'),
    aboutLine2: get('aboutLine2'),
    aboutLine2My: get('aboutLine2My'),
    aboutBody: get('aboutBody'),
    aboutBodyMy: get('aboutBodyMy'),

    contactLine1: get('contactLine1'),
    contactLine1My: get('contactLine1My'),
    contactLine2: get('contactLine2'),
    contactLine2My: get('contactLine2My'),
    contactBody: get('contactBody'),
    contactBodyMy: get('contactBodyMy'),
    contactCta: get('contactCta'),
    contactCtaMy: get('contactCtaMy'),
    contactEmail: get('contactEmail'),
    contactCopyright: get('contactCopyright'),
    contactCopyrightMy: get('contactCopyrightMy'),
    contactTagline: get('contactTagline'),
    contactTaglineMy: get('contactTaglineMy'),
  }

  const previous = await getHomepageContent()
  try {
    await saveHomepageContent(data)
  } catch (err) {
    return { error: err.message || 'Could not save. Please try again.' }
  }
  // Any image field (hero photo, a service's icon, a project's logo, ...)
  // that changed just orphaned its old upload forever — nothing else in
  // this app ever deletes an image, see lib/imageCleanup.js.
  await cleanupReplacedImages(previous, data)

  await logActivity('Homepage content saved')
  revalidatePath('/')
  revalidatePath('/admin/homepage')

  return { success: true, savedAt: Date.now() }
}
