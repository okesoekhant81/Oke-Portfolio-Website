import { readJson, writeJson, isBlobConfigured } from '../blobStore'
import { defaultWorkshopContent } from '../defaultWorkshopContent'

const PATH = 'content/workshop.json'

function resolveDefaults() {
  return {
    heroImage: defaultWorkshopContent.heroImageFallback.src,
    heroTitle: defaultWorkshopContent.heroTitle,
    heroTitleMy: defaultWorkshopContent.heroTitleMy,
    heroSubtitle: defaultWorkshopContent.heroSubtitle,
    heroSubtitleMy: defaultWorkshopContent.heroSubtitleMy,
    intro: defaultWorkshopContent.intro,
    introMy: defaultWorkshopContent.introMy,

    formatLabel: defaultWorkshopContent.formatLabel,
    formatLabelMy: defaultWorkshopContent.formatLabelMy,
    format: defaultWorkshopContent.format,
    formatMy: defaultWorkshopContent.formatMy,
    durationLabel: defaultWorkshopContent.durationLabel,
    durationLabelMy: defaultWorkshopContent.durationLabelMy,
    duration: defaultWorkshopContent.duration,
    durationMy: defaultWorkshopContent.durationMy,
    audienceLabel: defaultWorkshopContent.audienceLabel,
    audienceLabelMy: defaultWorkshopContent.audienceLabelMy,
    audience: defaultWorkshopContent.audience,
    audienceMy: defaultWorkshopContent.audienceMy,

    priceLabel: defaultWorkshopContent.priceLabel,
    priceLabelMy: defaultWorkshopContent.priceLabelMy,
    price: defaultWorkshopContent.price,
    priceMy: defaultWorkshopContent.priceMy,
    promoPrice: defaultWorkshopContent.promoPrice,
    promoPriceMy: defaultWorkshopContent.promoPriceMy,

    outlineHeading: defaultWorkshopContent.outlineHeading,
    outlineHeadingMy: defaultWorkshopContent.outlineHeadingMy,
    modules: defaultWorkshopContent.modules.map((m) => ({
      title: m.title,
      titleMy: m.titleMy,
      lessons: m.lessons,
      lessonsMy: m.lessonsMy,
    })),

    ctaHeading: defaultWorkshopContent.ctaHeading,
    ctaHeadingMy: defaultWorkshopContent.ctaHeadingMy,
    ctaBody: defaultWorkshopContent.ctaBody,
    ctaBodyMy: defaultWorkshopContent.ctaBodyMy,

    faqHeading: defaultWorkshopContent.faqHeading,
    faqHeadingMy: defaultWorkshopContent.faqHeadingMy,
    faqs: defaultWorkshopContent.faqs.map((f) => ({
      question: f.question,
      questionMy: f.questionMy,
      answer: f.answer,
      answerMy: f.answerMy,
    })),

    // Optional and empty by default — the registration form only shows a
    // payment step once at least one method has a name filled in, so this
    // just means "no online payment option yet" rather than anything
    // broken. A QR image is optional per method (a registrant can just
    // copy the account number instead), not required.
    paymentMethods: [],

    // Shown on the registration-confirmed email (see lib/registrantEmail.js)
    // — the same platform/language for every class rather than per-class,
    // since unlike the date/time these don't change class to class.
    sessionPlatform: '',
    sessionPlatformMy: '',
    sessionLanguage: '',
    sessionLanguageMy: '',
  }
}

export async function getWorkshopContent() {
  const defaults = resolveDefaults()
  if (!isBlobConfigured) return defaults

  const saved = await readJson(PATH)
  if (!saved) return defaults

  return {
    ...defaults,
    ...saved,
    modules: saved.modules?.length ? saved.modules : defaults.modules,
    faqs: saved.faqs?.length ? saved.faqs : defaults.faqs,
  }
}

export async function saveWorkshopContent(data) {
  await writeJson(PATH, data)
}
