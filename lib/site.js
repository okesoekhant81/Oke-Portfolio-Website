// Vercel redirects the apex domain to www, so this must be the www form —
// otherwise every URL in the sitemap/canonical tags/JSON-LD resolves through
// a redirect instead of a direct 200, which Google's sitemap validator rejects.
export const SITE_URL = 'https://www.okesoekhant.com'
export const SITE_NAME = 'Oke Soe Khant'
export const SITE_DESCRIPTION =
  'Oke Soe Khant — brand strategy, marketing, content, and digital experience. Helping businesses turn ideas into brands and brands into growth.'

// Only loaded client-side after cookie consent is accepted — see
// components/GoogleAnalytics.jsx and components/CookieConsent.jsx. Not a
// secret (it's visible in any page's source once the script loads), so a
// plain constant here rather than an env var, same as SITE_URL/SITE_NAME.
export const GA_MEASUREMENT_ID = 'G-D3LKLNTR5K'

export const SOCIAL_LINKS = [
  'https://www.facebook.com/okesoekhant11/',
  'https://ae.linkedin.com/in/okesoekhant11',
  'https://www.tiktok.com/@okethestrategist',
  'https://www.instagram.com/okesoekhant11',
]

// Rendered as icons in the footer. WhatsApp is a contact channel rather
// than a profile, so it's kept out of SOCIAL_LINKS (used for JSON-LD's
// sameAs, which expects profile URLs).
export const SOCIAL_ICONS = [
  { name: 'Facebook', href: 'https://www.facebook.com/okesoekhant11/' },
  { name: 'Instagram', href: 'https://www.instagram.com/okesoekhant11' },
  { name: 'LinkedIn', href: 'https://ae.linkedin.com/in/okesoekhant11' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@okethestrategist' },
  { name: 'WhatsApp', href: 'https://wa.me/971556556029' },
]
