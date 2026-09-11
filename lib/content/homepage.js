import { kv, isKvConfigured } from '../kv'
import { defaultContent } from '../defaultContent'

const KEY = 'homepage'

function resolveDefaults() {
  return {
    heroName: defaultContent.heroName,
    heroBody: defaultContent.heroBody,
    heroBadgePrefix: defaultContent.heroBadgePrefix,
    heroBadgeEmphasis: defaultContent.heroBadgeEmphasis,
    heroImage: defaultContent.heroImageFallback.src,

    marketingLine1: defaultContent.marketingLine1,
    marketingLine2: defaultContent.marketingLine2,
    marketingBody: defaultContent.marketingBody,

    services: defaultContent.services.map((s) => ({
      title: s.title,
      copy: s.copy,
      image: s.imageFallback.src,
    })),

    strategyLine1: defaultContent.strategyLine1,
    strategyLine2: defaultContent.strategyLine2,
    strategyParagraph: defaultContent.strategyParagraph,
    strategyQuote: defaultContent.strategyQuote,

    buildingLine1: defaultContent.buildingLine1,
    buildingLine2: defaultContent.buildingLine2,
    buildingIntro: defaultContent.buildingIntro,
    buildingEmphasis: defaultContent.buildingEmphasis,
    projects: defaultContent.projects.map((p) => ({
      name: p.name,
      location: p.location,
      description: p.description,
      role: p.role,
      logo: p.logoFallback.src,
    })),

    workshopImage: defaultContent.workshopImageFallback.src,
    workshopLine1: defaultContent.workshopLine1,
    workshopLine2: defaultContent.workshopLine2,
    workshopBody: defaultContent.workshopBody,
    workshopRole: defaultContent.workshopRole,

    aboutLine1: defaultContent.aboutLine1,
    aboutLine2: defaultContent.aboutLine2,
    aboutBody: defaultContent.aboutBody,

    contactLine1: defaultContent.contactLine1,
    contactLine2: defaultContent.contactLine2,
    contactBody: defaultContent.contactBody,
    contactCta: defaultContent.contactCta,
    contactEmail: defaultContent.contactEmail,
    contactCopyright: defaultContent.contactCopyright,
    contactTagline: defaultContent.contactTagline,
  }
}

export async function getHomepageContent() {
  const defaults = resolveDefaults()
  if (!isKvConfigured) return defaults

  try {
    const saved = await kv.get(KEY)
    if (!saved) return defaults
    return {
      ...defaults,
      ...saved,
      services: saved.services?.length ? saved.services : defaults.services,
      projects: saved.projects?.length ? saved.projects : defaults.projects,
    }
  } catch {
    return defaults
  }
}

export async function saveHomepageContent(data) {
  if (!isKvConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel KV store first.')
  }
  await kv.set(KEY, data)
}
