import './globals.css'
// Self-hosted rather than pulled from Google Fonts at runtime: Playfair
// Display / SF Pro have no Myanmar glyphs, and this site's Myanmar-reading
// audience shouldn't depend on fonts.googleapis.com being reachable for
// its own UI to render correctly. Only the 400/700 weights actually used
// (bold headings, regular body) to keep the bundle lean.
import '@fontsource/noto-sans-myanmar/400.css'
import '@fontsource/noto-sans-myanmar/700.css'
import '@fontsource/noto-serif-myanmar/400.css'
import '@fontsource/noto-serif-myanmar/700.css'
import CookieConsent from '../components/CookieConsent'
import GoogleAnalytics from '../components/GoogleAnalytics'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '../lib/site'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Brand Strategy & Growth`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Oke Soe Khant',
    'brand strategy',
    'digital marketing',
    'brand positioning',
    'content strategy',
    'Myanmar SME',
    'business growth',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': `${SITE_URL}/rss.xml` },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Brand Strategy & Growth`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE_NAME }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Brand Strategy & Growth`,
    description: SITE_DESCRIPTION,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  // Deliberately not locale-aware here (stays a plain, static component):
  // reading the locale cookie in the shared root layout would force every
  // route through it — including /admin, which has nothing to do with this
  // feature — into dynamic rendering. The public pages that actually need
  // the locale (home, blog list, blog detail) read the cookie themselves.
  return (
    <html lang="en">
      <head>
        {/* Runs before paint so the stored/preferred theme applies with no
            flash of the wrong theme; admin pages never render a toggle or
            use dark: classes, so this only affects the public site. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();",
          }}
        />
        {/* Same before-paint, cookie-only trick as the theme script above —
            the locale cookie (see lib/dictionaries.js's LOCALE_COOKIE)
            decides which language the page's own content renders in, but
            <html lang> was left hardcoded to "en" regardless, which is
            wrong for a My-locale visitor (screen readers, translation
            prompts, and language detection all read this attribute).
            Setting it here client-side keeps the root layout itself a
            plain static component — see the comment below on why that
            matters — rather than making every route (including /admin)
            dynamic just to read one cookie server-side. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=document.cookie.match(/(?:^|; )locale=([^;]+)/);if(m&&decodeURIComponent(m[1])==='my')document.documentElement.lang='my';}catch(e){}})();",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <CookieConsent />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
