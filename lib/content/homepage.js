import { readJson, writeJson, isBlobConfigured } from '../blobStore'
import { defaultContent } from '../defaultContent'

const PATH = 'content/homepage.json'

function resolveDefaults() {
  return {
    heroName: defaultContent.heroName,
    heroBody: defaultContent.heroBody,
    heroBodyMy: defaultContent.heroBodyMy,
    heroBadgePrefix: defaultContent.heroBadgePrefix,
    heroBadgePrefixMy: defaultContent.heroBadgePrefixMy,
    heroBadgeEmphasis: defaultContent.heroBadgeEmphasis,
    heroBadgeEmphasisMy: defaultContent.heroBadgeEmphasisMy,
    heroImage: defaultContent.heroImageFallback.src,

    marketingLine1: defaultContent.marketingLine1,
    marketingLine1My: defaultContent.marketingLine1My,
    marketingLine2: defaultContent.marketingLine2,
    marketingLine2My: defaultContent.marketingLine2My,
    marketingBody: defaultContent.marketingBody,
    marketingBodyMy: defaultContent.marketingBodyMy,

    services: defaultContent.services.map((s) => ({
      title: s.title,
      titleMy: s.titleMy,
      copy: s.copy,
      copyMy: s.copyMy,
      image: s.imageFallback.src,
    })),

    strategyLine1: defaultContent.strategyLine1,
    strategyLine1My: defaultContent.strategyLine1My,
    strategyLine2: defaultContent.strategyLine2,
    strategyLine2My: defaultContent.strategyLine2My,
    strategyParagraph: defaultContent.strategyParagraph,
    strategyParagraphMy: defaultContent.strategyParagraphMy,
    strategyQuote: defaultContent.strategyQuote,
    strategyQuoteMy: defaultContent.strategyQuoteMy,

    buildingLine1: defaultContent.buildingLine1,
    buildingLine1My: defaultContent.buildingLine1My,
    buildingLine2: defaultContent.buildingLine2,
    buildingLine2My: defaultContent.buildingLine2My,
    buildingIntro: defaultContent.buildingIntro,
    buildingIntroMy: defaultContent.buildingIntroMy,
    buildingEmphasis: defaultContent.buildingEmphasis,
    buildingEmphasisMy: defaultContent.buildingEmphasisMy,
    projects: defaultContent.projects.map((p) => ({
      name: p.name,
      location: p.location,
      locationMy: p.locationMy,
      description: p.description,
      descriptionMy: p.descriptionMy,
      role: p.role,
      roleMy: p.roleMy,
      logo: p.logoFallback.src,
    })),

    workshopImage: defaultContent.workshopImageFallback.src,
    workshopLine1: defaultContent.workshopLine1,
    workshopLine1My: defaultContent.workshopLine1My,
    workshopLine2: defaultContent.workshopLine2,
    workshopLine2My: defaultContent.workshopLine2My,
    workshopBody: defaultContent.workshopBody,
    workshopBodyMy: defaultContent.workshopBodyMy,
    workshopRole: defaultContent.workshopRole,
    workshopRoleMy: defaultContent.workshopRoleMy,

    promoEnabled: defaultContent.promoEnabled,
    promoHeading: defaultContent.promoHeading,
    promoHeadingMy: defaultContent.promoHeadingMy,
    promoBody: defaultContent.promoBody,
    promoBodyMy: defaultContent.promoBodyMy,
    promoCta: defaultContent.promoCta,
    promoCtaMy: defaultContent.promoCtaMy,

    aboutLine1: defaultContent.aboutLine1,
    aboutLine1My: defaultContent.aboutLine1My,
    aboutLine2: defaultContent.aboutLine2,
    aboutLine2My: defaultContent.aboutLine2My,
    aboutBody: defaultContent.aboutBody,
    aboutBodyMy: defaultContent.aboutBodyMy,

    contactLine1: defaultContent.contactLine1,
    contactLine1My: defaultContent.contactLine1My,
    contactLine2: defaultContent.contactLine2,
    contactLine2My: defaultContent.contactLine2My,
    contactBody: defaultContent.contactBody,
    contactBodyMy: defaultContent.contactBodyMy,
    contactCta: defaultContent.contactCta,
    contactCtaMy: defaultContent.contactCtaMy,
    contactEmail: defaultContent.contactEmail,
    contactCopyright: defaultContent.contactCopyright,
    contactCopyrightMy: defaultContent.contactCopyrightMy,
    contactTagline: defaultContent.contactTagline,
    contactTaglineMy: defaultContent.contactTaglineMy,
  }
}

export async function getHomepageContent() {
  const defaults = resolveDefaults()
  if (!isBlobConfigured) return defaults

  const saved = await readJson(PATH)
  if (!saved) return defaults

  return {
    ...defaults,
    ...saved,
    services: saved.services?.length ? saved.services : defaults.services,
    projects: saved.projects?.length ? saved.projects : defaults.projects,
  }
}

export async function saveHomepageContent(data) {
  await writeJson(PATH, data)
}
