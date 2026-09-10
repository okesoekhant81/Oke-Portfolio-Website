import { client } from '../sanity/lib/client'
import { urlFor } from '../sanity/lib/image'
import { isSanityConfigured } from '../sanity/env'
import { defaultContent } from './defaultContent'

const HOMEPAGE_QUERY = `*[_type == "homepage" && _id == "homepage"][0]`

function resolveImage(sanityImage, fallback) {
  if (sanityImage?.asset) return urlFor(sanityImage).url()
  return fallback.src
}

export async function getHomepage() {
  let doc = null

  if (isSanityConfigured) {
    try {
      doc = await client.fetch(HOMEPAGE_QUERY)
    } catch {
      doc = null
    }
  }

  const pick = (key) => doc?.[key] ?? defaultContent[key]

  return {
    heroName: pick('heroName'),
    heroBody: pick('heroBody'),
    heroBadgePrefix: pick('heroBadgePrefix'),
    heroBadgeEmphasis: pick('heroBadgeEmphasis'),
    heroImage: resolveImage(doc?.heroImage, defaultContent.heroImageFallback),

    marketingLine1: pick('marketingLine1'),
    marketingLine2: pick('marketingLine2'),
    marketingBody: pick('marketingBody'),

    services: (doc?.services?.length ? doc.services : defaultContent.services).map((service, i) => ({
      title: service.title ?? defaultContent.services[i]?.title,
      copy: service.copy ?? defaultContent.services[i]?.copy,
      image: resolveImage(service.image, defaultContent.services[i]?.imageFallback ?? defaultContent.services[0].imageFallback),
    })),

    strategyLine1: pick('strategyLine1'),
    strategyLine2: pick('strategyLine2'),
    strategyParagraph: pick('strategyParagraph'),
    strategyQuote: pick('strategyQuote'),

    buildingLine1: pick('buildingLine1'),
    buildingLine2: pick('buildingLine2'),
    buildingIntro: pick('buildingIntro'),
    buildingEmphasis: pick('buildingEmphasis'),
    projects: (doc?.projects?.length ? doc.projects : defaultContent.projects).map((project, i) => ({
      name: project.name ?? defaultContent.projects[i]?.name,
      location: project.location ?? defaultContent.projects[i]?.location,
      description: project.description ?? defaultContent.projects[i]?.description,
      role: project.role ?? defaultContent.projects[i]?.role,
      logo: resolveImage(project.logo, defaultContent.projects[i]?.logoFallback ?? defaultContent.projects[0].logoFallback),
    })),

    workshopImage: resolveImage(doc?.workshopImage, defaultContent.workshopImageFallback),
    workshopLine1: pick('workshopLine1'),
    workshopLine2: pick('workshopLine2'),
    workshopBody: pick('workshopBody'),
    workshopRole: pick('workshopRole'),

    aboutLine1: pick('aboutLine1'),
    aboutLine2: pick('aboutLine2'),
    aboutBody: pick('aboutBody'),

    contactLine1: pick('contactLine1'),
    contactLine2: pick('contactLine2'),
    contactBody: pick('contactBody'),
    contactCta: pick('contactCta'),
    contactEmail: pick('contactEmail'),
    contactCopyright: pick('contactCopyright'),
    contactTagline: pick('contactTagline'),
  }
}
