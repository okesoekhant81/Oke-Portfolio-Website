'use client'

import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, getDictionary } from '../lib/dictionaries'

// Cookie (not localStorage) so the server can render the right language on
// first paint — same reasoning as the dark-mode toggle avoiding a flash,
// but more important here since a flash of the wrong TEXT is far more
// jarring than a flash of the wrong color.
export default function LocaleToggle({ locale }) {
  const router = useRouter()
  const dict = getDictionary(locale)

  function toggle() {
    const next = locale === 'my' ? 'en' : 'my'
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dict.locale.toggleAria}
      // The label shows the *other* language's name — Myanmar script has no
      // italic form (see italicIfLatin in lib/dictionaries.js), so italic
      // only belongs here when the label being shown is Latin ("EN").
      className={`font-display text-sm font-bold text-white/70 transition-colors duration-300 hover:text-brand ${locale === 'my' ? 'italic' : ''}`}
    >
      {dict.locale.toggleLabel}
    </button>
  )
}
