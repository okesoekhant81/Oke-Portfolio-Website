'use client'

import { useEffect, useState } from 'react'
import { ICON_PATHS } from './SocialIcons'
import { SOCIAL_ICONS } from '../lib/site'

const whatsapp = SOCIAL_ICONS.find((s) => s.name === 'WhatsApp')

// Same admin-route exclusion as CookieConsent — admin is the site owner's
// own workspace, not a visitor, so a "chat with us" affordance is
// pointless there. Positioned above where the cookie banner sits (rather
// than reading its dismissal state) so the two never overlap regardless
// of whether the banner is currently showing.
export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return
    setVisible(true)
  }, [])

  if (!visible || !whatsapp) return null

  return (
    <a
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 sm:right-6"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d={ICON_PATHS.WhatsApp} />
      </svg>
    </a>
  )
}
