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
      empty: 'No articles published yet — check back soon.',
      allArticles: 'All articles',
      youMayLike: 'Articles You May Like',
    },
    home: {
      latestArticles: 'Latest Articles',
      viewAll: 'View all',
      projectPrefix: 'A digital discovery platform built for the ',
      projectSuffix: '.',
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
      empty: 'ဆောင်းပါးများ မတင်ရသေးပါ — မကြာမီ ပြန်လာကြည့်ပါ။',
      allArticles: 'ဆောင်းပါးအားလုံး',
      youMayLike: 'သင်ကြိုက်နှစ်သက်နိုင်သော ဆောင်းပါးများ',
    },
    home: {
      latestArticles: 'နောက်ဆုံးရ ဆောင်းပါးများ',
      viewAll: 'အားလုံးကြည့်ရန်',
      projectPrefix: '',
      projectSuffix: ' အတွက် တည်ဆောက်ပေးခဲ့သည့် ဒစ်ဂျစ်တယ် ရှာဖွေရေးပလက်ဖောင်းတစ်ခု။',
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
