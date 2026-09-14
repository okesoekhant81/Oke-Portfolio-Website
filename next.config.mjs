/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Admin-uploaded images (hero photo, service/project images, post
    // covers) are stored in Vercel Blob, which serves each store from its
    // own random subdomain — hence the wildcard rather than one fixed host.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  // Baseline hardening headers on every response, admin and public alike.
  // No Content-Security-Policy here: this site loads Google Fonts, inline
  // scripts (the no-flash theme setter in layout.jsx), and Vercel Blob
  // images from a wildcard subdomain, and getting a CSP wrong silently
  // breaks rendering rather than failing loudly — not worth the risk for
  // a personal site without a dedicated pass to build and test one.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig
