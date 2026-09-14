export const LOCALE_COOKIE = 'locale'
export const DEFAULT_LOCALE = 'en'
export const LOCALES = ['en', 'my']

// Phase 1: static UI chrome only (nav, headings, buttons, dates) — the
// actual CMS-driven content (hero bio, service copy, post bodies, footer
// text) is free-typed through the admin panel and stays whatever language
// it was written in until that gets bilingual fields of its own.
export const dictionaries = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      work: 'Work',
      about: 'About',
      articles: 'Articles',
      contact: 'Contact',
    },
    blog: {
      heading: 'Articles',
      metaDescription: 'Writing on brand strategy, marketing, content, and digital growth from Oke Soe Khant.',
      empty: 'No articles published yet — check back soon.',
      searchPlaceholder: 'Search articles…',
      allArticles: 'All articles',
      youMayLike: 'Articles You May Like',
      likeAria: 'Like this article',
      unlikeAria: 'Remove like',
      share: 'Share',
      shareAria: 'Share this article',
      linkCopied: 'Link copied',
    },
    home: {
      latestArticles: 'Latest Articles',
      viewAll: 'View all articles',
      projectPrefix: 'A digital discovery platform built for the ',
      projectSuffix: '.',
      aboutCta: 'My Full Story',
    },
    workshop: {
      viewDetails: 'View Course Details',
      backToHome: 'Back to home',
      formatLabel: 'Format',
      durationLabel: 'Duration',
      audienceLabel: "Who it's for",
      cohortActiveLabel: 'Cohort in progress',
      cohortActiveBody: 'students are currently learning together',
      nextCohortLabel: 'Next class opens',
      formClassDate: 'Which class date works for you?',
      formClassDatePick: 'Choose a date',
      formName: 'Full name',
      formEmail: 'Email',
      formPhone: 'Phone / WhatsApp number',
      formBusiness: 'Business / company name',
      formRole: 'Your role',
      formParticipants: 'Number of participants',
      formParticipants1: '1',
      formParticipants2: '2',
      formParticipants3to5: '3–5',
      formParticipants5plus: 'More than 5',
      formHearAbout: 'How did you hear about this workshop?',
      formHearAboutPick: 'Select one',
      formHearAboutFacebook: 'Facebook',
      formHearAboutInstagram: 'Instagram',
      formHearAboutTiktok: 'TikTok',
      formHearAboutReferral: 'A friend or colleague',
      formHearAboutSearch: 'Google search',
      formHearAboutOther: 'Other',
      formMessage: 'Questions or notes (optional)',
      formOptionalHint: "A few optional details — or just hit submit.",
      formStep: 'Step',
      formNext: 'Next',
      formBack: 'Back',
      formSubmit: 'Reserve my seat',
      formSubmitting: 'Sending…',
      formSuccessTitle: "You're on the list!",
      formSuccessBody: "Thanks for registering — we'll be in touch with the next available schedule.",
      formSuccessBodyPayment: "Thanks for registering! We're reviewing your payment now — once it's confirmed, you'll get a confirmation email with the full workshop details.",
      formSuccessRegistrationId: 'Registration ID',
      formSuccessSaveHint: 'Save this — screenshot this page or copy the ID below for your records.',
      formSeatsLeft: 'seats left',
      formFull: 'Full — join the waitlist',
      formWaitlistSubmit: 'Join the waitlist',
      formWaitlistNote: "This class is full — we'll reach out if a seat opens up.",
      formWaitlistSuccessTitle: "You're on the waitlist!",
      formWaitlistSuccessBody: "We'll email you if a seat opens up for this class.",
      formPaymentHeading: 'Payment',
      formPaymentAccountName: 'Account name',
      formPaymentAccountNumber: 'Account number',
      formPaymentCopy: 'Copy',
      formPaymentCopied: 'Copied!',
      formPaymentUpload: 'Upload payment screenshot',
      formPaymentUploading: 'Uploading…',
      formPaymentUploaded: 'Uploaded ✓',
      formPaymentUploadError: 'Upload failed — please try again.',
      formPaymentRequiredHint: 'Please complete the payment above and upload your screenshot to confirm your registration.',
      formPaymentMissingError: 'Please upload your payment screenshot before submitting.',
    },
    cookieConsent: {
      message: 'This site uses essential cookies to run, plus Google Analytics if you accept — that one is optional and off by default.',
      accept: 'Accept',
      decline: 'Decline',
      learnMore: 'Read our cookie policy',
    },
    testimonials: {
      heading: 'What Students Say',
      shareCta: 'Share your experience',
      formName: 'Your name',
      formRole: 'Role / business (optional)',
      formQuote: 'Your experience',
      formSubmit: 'Submit',
      formSubmitting: 'Submitting…',
      formSuccess: 'Thanks! Your testimonial will appear after a quick review.',
      formCancel: 'Cancel',
    },
    newsletter: {
      heading: 'Get new articles by email',
      placeholder: 'you@example.com',
      button: 'Subscribe',
      success: "You're subscribed — thanks!",
    },
    privacy: {
      metaTitle: 'Privacy & Cookies',
      headingLine1: 'Privacy &',
      headingLine2: 'Cookies',
      intro: 'A short, plain-language page — most of the cookies here are essential, and the one that isn’t only runs if you say yes.',
      body: "**Cookies this site uses**\n\n*admin_session* — keeps the site owner signed in to the admin panel after logging in. Essential, only ever set on /admin, and never touches a visitor's browser unless they are the site owner. Expires after 30 days.\n\n*locale* — remembers whether you last viewed the site in English or Myanmar, so you don't have to switch it every visit. Expires after 1 year.\n\n*cookie_consent* — remembers your Accept/Decline choice below, so it doesn't ask again. Expires after 1 year.\n\n**Google Analytics — optional**\n\nIf you click Accept on the cookie banner, this site loads Google Analytics (*_ga*, *_ga_\\**) to see how many people visit and which pages they read — nothing more specific than that, and IP addresses are anonymized. It does not load at all unless you accept, and declining (or just not answering) keeps it off. No advertising cookies are used, from Google or anyone else.\n\n**Workshop registration**\n\nIf you register for the workshop, the name, email, phone number, and any other details you enter are stored only to get in touch with you about it — never sold, shared, or used for anything else.\n\n**Newsletter**\n\nIf you subscribe for new article emails, your email address is stored only for that — never sold, shared, or used for anything else. There's no unsubscribe link automated yet; reach out through the contact section and it'll be removed.\n\n**Questions**\n\nReach out any time through the contact section on the homepage.",
    },
    locale: {
      dateLocale: 'en-US',
      toggleLabel: 'မြန်',
      toggleAria: 'Switch to Myanmar',
    },
  },
  my: {
    nav: {
      home: 'ပင်မ',
      services: 'ဝန်ဆောင်မှုများ',
      work: 'လုပ်ငန်းများ',
      about: 'ကျွန်ုပ်အကြောင်း',
      articles: 'ဆောင်းပါးများ',
      contact: 'ဆက်သွယ်ရန်',
    },
    blog: {
      heading: 'ဆောင်းပါးများ',
      metaDescription: 'အမှတ်တံဆိပ် ဗျူဟာ၊ စျေးကွက်ရှာဖွေရေး၊ အကြောင်းအရာနှင့် ဒစ်ဂျစ်တယ် ကြီးထွားမှုဆိုင်ရာ ဆောင်းပါးများ။',
      empty: 'ဆောင်းပါးများ မတင်ရသေးပါ — မကြာမီ ပြန်လာကြည့်ပါ။',
      searchPlaceholder: 'ဆောင်းပါးများ ရှာဖွေရန်…',
      allArticles: 'ဆောင်းပါးအားလုံး',
      youMayLike: 'သင်ကြိုက်နှစ်သက်နိုင်သော ဆောင်းပါးများ',
      likeAria: 'ဒီဆောင်းပါးကို နှစ်သက်ပါ',
      unlikeAria: 'နှစ်သက်မှု ပြန်ဖျက်ရန်',
      share: 'မျှဝေရန်',
      shareAria: 'ဒီဆောင်းပါးကို မျှဝေရန်',
      linkCopied: 'လင့်ခ် ကူးယူပြီးပါပြီ',
    },
    home: {
      latestArticles: 'နောက်ဆုံးရ ဆောင်းပါးများ',
      viewAll: 'ဆောင်းပါးအားလုံးကြည့်ရန်',
      projectPrefix: '',
      projectSuffix: ' အတွက် တည်ဆောက်ပေးခဲ့သည့် ဒစ်ဂျစ်တယ် ရှာဖွေရေးပလက်ဖောင်းတစ်ခု။',
      aboutCta: 'ကျွန်ုပ်အကြောင်း အပြည့်အစုံ',
    },
    workshop: {
      viewDetails: 'သင်တန်း အသေးစိတ် ကြည့်ရန်',
      backToHome: 'ပင်မစာမျက်နှာသို့',
      formatLabel: 'ပုံစံ',
      durationLabel: 'ကြာချိန်',
      audienceLabel: 'ဘယ်သူတွေအတွက်လဲ',
      cohortActiveLabel: 'သင်တန်း လက်ရှိသင်ကြားနေဆဲ',
      cohortActiveBody: 'ဦး လက်ရှိအတူတကွ သင်ယူနေကြပါသည်',
      nextCohortLabel: 'နောက်သင်တန်း ဖွင့်မည့်ရက်',
      formClassDate: 'ဘယ်သင်တန်းရက်စွဲက သင့်အတွက်အဆင်ပြေလဲ?',
      formClassDatePick: 'ရက်စွဲရွေးပါ',
      formName: 'အမည်အပြည့်အစုံ',
      formEmail: 'အီးမေးလ်',
      formPhone: 'ဖုန်း / WhatsApp နံပါတ်',
      formBusiness: 'လုပ်ငန်း / ကုမ္ပဏီအမည်',
      formRole: 'သင့်ရာထူး',
      formParticipants: 'တက်ရောက်မည့် လူဦးရေ',
      formParticipants1: '1',
      formParticipants2: '2',
      formParticipants3to5: '3–5',
      formParticipants5plus: '5 ထက်ပို',
      formHearAbout: 'ဒီသင်တန်းအကြောင်း ဘယ်ကနေသိရှိခဲ့ပါသလဲ?',
      formHearAboutPick: 'တစ်ခုရွေးပါ',
      formHearAboutFacebook: 'Facebook',
      formHearAboutInstagram: 'Instagram',
      formHearAboutTiktok: 'TikTok',
      formHearAboutReferral: 'သူငယ်ချင်း သို့မဟုတ် လုပ်ဖော်ကိုင်ဖက်',
      formHearAboutSearch: 'Google Search',
      formHearAboutOther: 'အခြား',
      formMessage: 'မေးခွန်းများ သို့မဟုတ် မှတ်ချက်များ (ရွေးချယ်ခွင့်)',
      formOptionalHint: 'ရွေးချယ်ခွင့်ရှိသော အချက်အလက်လေးများ — မဖြည့်ချင်ရင် Submit ကိုတိုက်ရိုက်နှိပ်နိုင်ပါတယ်။',
      formStep: 'အဆင့်',
      formNext: 'ရှေ့ဆက်ရန်',
      formBack: 'နောက်သို့',
      formSubmit: 'နေရာယူမည်',
      formSubmitting: 'ပို့နေသည်…',
      formSuccessTitle: 'စာရင်းပေးသွင်းပြီးပါပြီ!',
      formSuccessBody: 'စာရင်းပေးသွင်းတဲ့အတွက် ကျေးဇူးတင်ပါတယ် — နောက်ထပ် အချိန်ဇယား ရရှိနိုင်တဲ့အခါ ဆက်သွယ်ပါမယ်။',
      formSuccessBodyPayment: 'စာရင်းပေးသွင်းတဲ့အတွက် ကျေးဇူးတင်ပါတယ်! သင့်ငွေပေးချေမှုကို စစ်ဆေးနေပါတယ် — အတည်ပြုပြီးရင် Workshop အသေးစိတ်ပါတဲ့ confirmation email ပို့ပေးပါမယ်။',
      formSuccessRegistrationId: 'မှတ်ပုံတင်အမှတ် (Registration ID)',
      formSuccessSaveHint: 'ဒီစာမျက်နှာကို Screenshot ရိုက်ထားပါ (သို့) အောက်က ID ကို ကူးယူသိမ်းထားပါ။',
      formSeatsLeft: 'နေရာ ကျန်ရှိသည်',
      formFull: 'နေရာပြည့်ပါပြီ — Waitlist တွင် စာရင်းသွင်းပါ',
      formWaitlistSubmit: 'Waitlist တွင် စာရင်းသွင်းမည်',
      formWaitlistNote: 'ဒီသင်တန်းရက် နေရာပြည့်နေပါပြီ — နေရာလွတ်လာရင် ဆက်သွယ်ပါမယ်။',
      formWaitlistSuccessTitle: 'Waitlist တွင် စာရင်းသွင်းပြီးပါပြီ!',
      formWaitlistSuccessBody: 'ဒီသင်တန်းရက်အတွက် နေရာလွတ်လာရင် အီးမေးလ်ဖြင့် အကြောင်းကြားပါမယ်။',
      formPaymentHeading: 'ငွေပေးချေမှု',
      formPaymentAccountName: 'အကောင့်အမည်',
      formPaymentAccountNumber: 'အကောင့်နံပါတ်',
      formPaymentCopy: 'ကူးယူရန်',
      formPaymentCopied: 'ကူးယူပြီးပါပြီ!',
      formPaymentUpload: 'ငွေလွှဲပြေစာ Screenshot တင်ရန်',
      formPaymentUploading: 'တင်နေသည်…',
      formPaymentUploaded: 'တင်ပြီးပါပြီ ✓',
      formPaymentUploadError: 'တင်၍မရပါ — ထပ်စမ်းကြည့်ပါ။',
      formPaymentRequiredHint: 'ကျေးဇူးပြု၍ အပေါ်က ငွေပေးချေမှု ပြီးမြောက်အောင်လုပ်ပြီး Screenshot တင်ပေးမှသာ စာရင်းပေးသွင်းမှု အတည်ဖြစ်ပါမည်။',
      formPaymentMissingError: 'Submit မလုပ်မီ ငွေလွှဲ Screenshot ကို တင်ပေးပါ။',
    },
    cookieConsent: {
      message: 'ဒီဆိုက်မှာ လိုအပ်တဲ့ cookie တွေအပြင် သင် Accept လုပ်မှသာ Google Analytics ကို ထပ်သုံးပါမယ် — ဒါက optional ဖြစ်ပြီး default အနေနဲ့ ပိတ်ထားပါတယ်။',
      accept: 'Accept',
      decline: 'Decline',
      learnMore: 'Cookie မူဝါဒဖတ်ရန်',
    },
    testimonials: {
      heading: 'သင်တန်းသားများ ပြောကြားချက်',
      shareCta: 'သင့်အတွေ့အကြုံ မျှဝေပါ',
      formName: 'သင့်အမည်',
      formRole: 'ရာထူး / လုပ်ငန်း (ရွေးချယ်ခွင့်)',
      formQuote: 'သင့်အတွေ့အကြုံ',
      formSubmit: 'တင်ပါ',
      formSubmitting: 'တင်နေသည်…',
      formSuccess: 'ကျေးဇူးတင်ပါတယ်! စစ်ဆေးပြီးရင် ပြသပါမယ်။',
      formCancel: 'မလုပ်တော့ပါ',
    },
    newsletter: {
      heading: 'ဆောင်းပါးအသစ်တွေကို အီးမေးလ်နဲ့ ရယူပါ',
      placeholder: 'you@example.com',
      button: 'Subscribe',
      success: 'Subscribe ဖြစ်ပါပြီ — ကျေးဇူးတင်ပါတယ်!',
    },
    privacy: {
      metaTitle: 'ကိုယ်ရေးကိုယ်တာနှင့် Cookie',
      headingLine1: 'ကိုယ်ရေးကိုယ်တာနှင့်',
      headingLine2: 'Cookie',
      intro: 'ရှင်းလင်းလွယ်ကူသော စာမျက်နှာလေးပါ — cookie အများစုက လိုအပ်သောအရာများဖြစ်ပြီး၊ optional ဖြစ်တဲ့တစ်ခုကတော့ သင် Accept လုပ်မှသာ အလုပ်လုပ်ပါမယ်။',
      body: '**ဒီဆိုက်မှာသုံးတဲ့ Cookie များ**\n\n*admin_session* — ဆိုက်ပိုင်ရှင် admin panel ထဲ login ဝင်ပြီးနောက် ဝင်ထားတာ မပြတ်အောင် ထိန်းထားပေးသည်။ လိုအပ်သော cookie ဖြစ်ပြီး /admin မှာသာ set လုပ်ပြီး ဆိုက်ပိုင်ရှင်မှလွဲ၍ တခြားလာလည်သူများ၏ browser တွင် လုံးဝ မသက်ရောက်ပါ။ ရက် ၃၀ အကြာတွင် သက်တမ်းကုန်ပါသည်။\n\n*locale* — နောက်ဆုံးကြည့်ရှုခဲ့သော ဘာသာစကား (English/မြန်မာ) ကို မှတ်ထားပြီး လာလည်တိုင်း ပြန်ပြောင်းစရာမလိုအောင် ကူညီပေးသည်။ ၁ နှစ်တွင် သက်တမ်းကုန်ပါသည်။\n\n*cookie_consent* — အောက်က Accept/Decline ရွေးချယ်မှုကို မှတ်ထားပြီး နောက်တစ်ကြိမ် ထပ်မမေးစေပါ။ ၁ နှစ်တွင် သက်တမ်းကုန်ပါသည်။\n\n**Google Analytics — Optional**\n\nCookie banner မှာ Accept နှိပ်ပါက ဒီဆိုက်က Google Analytics (*_ga*, *_ga_\\**) ကို load လုပ်ပြီး ဘယ်နှစ်ယောက်ဝင်လည်ခဲ့လဲ၊ ဘယ် page တွေကိုဖတ်ခဲ့လဲဆိုတာကို ကြည့်ရှုပါတယ် — ဒီထက်ပိုတိကျတဲ့ အချက်အလက်ဘာမှ မယူပါဘူး၊ IP address ကိုလည်း anonymize လုပ်ထားပါတယ်။ Accept မနှိပ်မချင်း (ဒါမှမဟုတ် ဘာမှမရွေးမချင်း) load လုံးဝ မဖြစ်ပါ။ ကြော်ငြာ cookie ဘယ်ကနေမှ (Google အပါအဝင်) မသုံးပါ။\n\n**Workshop စာရင်းပေးသွင်းခြင်း**\n\nWorkshop အတွက် စာရင်းပေးသွင်းပါက သင်ဖြည့်သွင်းသော အမည်၊ အီးမေးလ်၊ ဖုန်းနံပါတ်နှင့် အခြားအချက်အလက်များကို Workshop နှင့်ပတ်သက်၍ ဆက်သွယ်ရန်အတွက်သာ သိမ်းဆည်းထားပြီး အခြားမည်သည့်အတွက်မျှ အသုံးမပြုပါ — ရောင်းချခြင်း၊ မျှဝေခြင်း လုံးဝ မရှိပါ။\n\n**Newsletter**\n\nဆောင်းပါးအသစ် email အတွက် Subscribe လုပ်ပါက သင့် email လိပ်စာကို ဒီအတွက်သာ သိမ်းဆည်းထားပြီး အခြားမည်သည့်အတွက်မျှ အသုံးမပြုပါ — ရောင်းချခြင်း၊ မျှဝေခြင်း လုံးဝ မရှိပါ။ Unsubscribe link အလိုအလျောက် မရှိသေးပါ — ဆက်သွယ်ရန်အပိုင်းမှတစ်ဆင့် ဆက်သွယ်ရင် ဖျက်ပေးပါမည်။\n\n**မေးမြန်းလိုပါက**\n\nပင်မစာမျက်နှာရှိ ဆက်သွယ်ရန်အပိုင်းမှတစ်ဆင့် အချိန်မရွေး ဆက်သွယ်နိုင်ပါသည်။',
    },
    locale: {
      dateLocale: 'my',
      toggleLabel: 'EN',
      toggleAria: 'Switch to English',
    },
  },
}

export function getDictionary(locale) {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE]
}

// Myanmar script has no true italic form. Tailwind's `italic` utility still
// applies a synthetic/oblique slant to it, which corrupts the positioning
// of its stacked combining marks (renders as garbled, overlapping glyphs)
// — so any element whose text switches language with the locale must drop
// `italic` whenever that text is Myanmar.
export function italicIfLatin(locale) {
  return locale === 'my' ? '' : 'italic'
}

// Myanmar's stacked vowel signs and tone marks need much more vertical
// room than Latin text does at the same size — at a heading's usual
// `leading-tight` (or a large text-* utility's own tight default), marks
// from one line collide with the line above or below. Latin headings keep
// their existing tight leading untouched.
export function headingLeading(locale) {
  return locale === 'my' ? 'leading-relaxed' : ''
}

// headingLeading makes a Myanmar heading's own lines taller, but the gap
// between the heading and the paragraph right below it is a margin that
// collapses to a fixed value regardless of how tall the heading became —
// so a multi-line Myanmar heading ends up sitting almost flush against the
// body text beneath it. Real (non-collapsing) bottom padding, Myanmar only,
// fixes that without touching English spacing.
export function headingGap(locale) {
  return locale === 'my' ? 'pb-3 sm:pb-4' : ''
}
