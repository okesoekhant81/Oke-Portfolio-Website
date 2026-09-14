import { ICON_PATHS } from './SocialIcons'
import { SOCIAL_ICONS } from '../lib/site'

const whatsapp = SOCIAL_ICONS.find((s) => s.name === 'WhatsApp')

// Matches ThemeToggle/LocaleToggle's frosted-circle sizing so it sits
// naturally in the same fixed bottom-right stack (see NavMenu.jsx) rather
// than floating as its own separate element.
export default function WhatsAppButton() {
  if (!whatsapp) return null

  return (
    <a
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#25D366] shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
        <path d={ICON_PATHS.WhatsApp} />
      </svg>
    </a>
  )
}
