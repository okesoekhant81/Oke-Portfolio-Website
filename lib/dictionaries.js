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
      metaDescription: 'အမှတ်တံဆိပ် ဗျူဟာ၊ စျေးကွက်ရှာဖွေရေး၊ အကြောင်းအရာနှင့် ဒစ်ဂျစ်တယ် ကြီးထွားမှုဆိုင်ရာ ဆောင်းပါးများ။',
      empty: 'ဆောင်းပါးများ မတင်ရသေးပါ — မကြာမီ ပြန်လာကြည့်ပါ။',
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
