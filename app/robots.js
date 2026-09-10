import { SITE_URL } from '../lib/site'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/studio',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
