/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Admin-uploaded images (hero photo, service/project images, post
    // covers) are stored in Vercel Blob, which serves each store from its
    // own random subdomain — hence the wildcard rather than one fixed host.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
}

export default nextConfig
