// Vercel redirects the apex domain to www, so this must be the www form —
// otherwise every URL in the sitemap/canonical tags/JSON-LD resolves through
// a redirect instead of a direct 200, which Google's sitemap validator rejects.
export const SITE_URL = 'https://www.okesoekhant.com'
export const SITE_NAME = 'Oke Soe Khant'
export const SITE_DESCRIPTION =
  'Oke Soe Khant — brand strategy, marketing, content, and digital experience. Helping businesses turn ideas into brands and brands into growth.'

export const SOCIAL_LINKS = [
  'https://www.facebook.com/okesoekhant11/',
  'https://ae.linkedin.com/in/okesoekhant11',
  'https://www.tiktok.com/@okethestrategist',
  'https://www.instagram.com/okesoekhant11',
]
