// Resolves each bilingual field to the requested locale, falling back to
// English whenever the Myanmar counterpart hasn't been filled in yet — so a
// partially-translated site never shows blank text, just English until the
// admin gets to it. English itself is the field with no suffix; each
// translatable field's Myanmar counterpart is the same key + "My".
function pick(source, key, locale) {
  if (locale === 'my') {
    const myValue = source[`${key}My`]
    if (myValue) return myValue
  }
  return source[key]
}

export function localizeHomepageContent(content, locale) {
  if (locale !== 'my') return content

  return {
    ...content,
    heroBody: pick(content, 'heroBody', locale),
    heroBadgePrefix: pick(content, 'heroBadgePrefix', locale),
    heroBadgeEmphasis: pick(content, 'heroBadgeEmphasis', locale),

    marketingLine1: pick(content, 'marketingLine1', locale),
    marketingLine2: pick(content, 'marketingLine2', locale),
    marketingBody: pick(content, 'marketingBody', locale),

    services: content.services.map((service) => ({
      ...service,
      title: pick(service, 'title', locale),
      copy: pick(service, 'copy', locale),
    })),

    strategyLine1: pick(content, 'strategyLine1', locale),
    strategyLine2: pick(content, 'strategyLine2', locale),
    strategyParagraph: pick(content, 'strategyParagraph', locale),
    strategyQuote: pick(content, 'strategyQuote', locale),

    buildingLine1: pick(content, 'buildingLine1', locale),
    buildingLine2: pick(content, 'buildingLine2', locale),
    buildingIntro: pick(content, 'buildingIntro', locale),
    buildingEmphasis: pick(content, 'buildingEmphasis', locale),
    projects: content.projects.map((project) => ({
      ...project,
      location: pick(project, 'location', locale),
      description: pick(project, 'description', locale),
      role: pick(project, 'role', locale),
    })),

    workshopLine1: pick(content, 'workshopLine1', locale),
    workshopLine2: pick(content, 'workshopLine2', locale),
    workshopBody: pick(content, 'workshopBody', locale),
    workshopRole: pick(content, 'workshopRole', locale),

    aboutLine1: pick(content, 'aboutLine1', locale),
    aboutLine2: pick(content, 'aboutLine2', locale),
    aboutBody: pick(content, 'aboutBody', locale),

    contactLine1: pick(content, 'contactLine1', locale),
    contactLine2: pick(content, 'contactLine2', locale),
    contactBody: pick(content, 'contactBody', locale),
    contactCta: pick(content, 'contactCta', locale),
    contactCopyright: pick(content, 'contactCopyright', locale),
    contactTagline: pick(content, 'contactTagline', locale),
  }
}

export function localizeWorkshopContent(content, locale) {
  if (locale !== 'my') return content

  return {
    ...content,
    heroTitle: pick(content, 'heroTitle', locale),
    heroSubtitle: pick(content, 'heroSubtitle', locale),
    intro: pick(content, 'intro', locale),

    formatLabel: pick(content, 'formatLabel', locale),
    format: pick(content, 'format', locale),
    durationLabel: pick(content, 'durationLabel', locale),
    duration: pick(content, 'duration', locale),
    audienceLabel: pick(content, 'audienceLabel', locale),
    audience: pick(content, 'audience', locale),

    priceLabel: pick(content, 'priceLabel', locale),
    price: pick(content, 'price', locale),
    promoPrice: pick(content, 'promoPrice', locale),

    outlineHeading: pick(content, 'outlineHeading', locale),
    modules: content.modules.map((module) => ({
      ...module,
      title: pick(module, 'title', locale),
      lessons: pick(module, 'lessons', locale),
    })),

    ctaHeading: pick(content, 'ctaHeading', locale),
    ctaBody: pick(content, 'ctaBody', locale),

    faqHeading: pick(content, 'faqHeading', locale),
    faqs: content.faqs.map((faq) => ({
      ...faq,
      question: pick(faq, 'question', locale),
      answer: pick(faq, 'answer', locale),
    })),
  }
}

export function localizePost(post, locale) {
  if (!post || locale !== 'my') return post
  return {
    ...post,
    title: pick(post, 'title', locale),
    excerpt: pick(post, 'excerpt', locale),
    body: pick(post, 'body', locale),
  }
}
