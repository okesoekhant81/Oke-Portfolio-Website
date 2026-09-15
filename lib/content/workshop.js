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

    // The editable parts of the registration-confirmed email — everything
    // else (greeting, the Date/Time/Location table, standard closing
    // lines) stays fixed template text in lib/registrantEmail.js. Defaults
    // match that file's own previous hardcoded copy, so leaving these
    // untouched changes nothing about what gets sent.
    paymentConfirmedSubject: 'Your Workshop Registration Is Confirmed',
    paymentConfirmedSubjectMy: 'သင့်ရဲ့ Workshop စာရင်းသွင်းမှု အတည်ပြုပြီးပါပြီ',
    paymentConfirmedBody:
      'This workshop is designed to help you move from simply doing marketing to thinking more strategically about business growth, starting from business fundamentals and building through customer understanding, branding, marketing, and growth.',
    paymentConfirmedBodyMy:
      'ဒီ workshop ဟာ marketing ကို ရိုးရိုးလုပ်နေရာကနေ business growth အတွက် ဗျူဟာမြောက် တွေးခေါ်တတ်အောင် ကူညီပေးဖို့ ရည်ရွယ်ပါတယ် — business fundamentals ကနေစပြီး customer understanding, branding, marketing နဲ့ growth ထိ ဆက်စပ်တည်ဆောက်ပေးထားပါတယ်။',
    paymentConfirmedSignature: 'Strategist / Workshop Instructor',
    paymentConfirmedSignatureMy: 'Strategist / Workshop Instructor',

    // Shown at the top of the certificate of completion (see
    // components/admin/PrintableCertificate.jsx) — optional, the
    // certificate still works with just the text header when this is blank.
    certificateLogo: '',
    // Shown above the issuer's signature line on the same certificate —
    // optional, falls back to a blank signature line when unset.
    certificateSignature: '',

    // Sent to every paid student in a class the moment its status is
    // changed to 'completed' (see updateClassDateStatusAction and
    // lib/registrantEmail.js's sendCertificateReady) — the editable part of
    // that email, same pattern as paymentConfirmedSubject/Body above.
    certificateReadySubject: 'Your Certificate of Completion Is Ready',
    certificateReadySubjectMy: 'သင့်ရဲ့ Certificate of Completion ပြင်ဆင်ပြီးပါပြီ',
    certificateReadyBody:
      'Congratulations on completing the workshop! You can view your certificate — and what you covered — using the link below.',
    certificateReadyBodyMy:
      'Workshop ကို ပြီးမြောက်အောင် သင်ယူပြီးစီးသွားတဲ့အတွက် ဂုဏ်ယူပါတယ်! အောက်က link ကနေ သင့် certificate နဲ့ ဘာတွေသင်ယူခဲ့တယ်ဆိုတာကို ကြည့်ရှုနိုင်ပါတယ်။',
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
