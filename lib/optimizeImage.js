import sharp from 'sharp'

const MAX_WIDTH = 1600

// Resizes to a sane max width and re-encodes to a compressed format —
// WebP when the source has transparency (logos, cutouts), JPEG otherwise
// (photos). Keeps uploads small without a visible quality hit.
export async function optimizeImage(buffer) {
  const image = sharp(buffer)
  const metadata = await image.metadata()

  const resized = image.resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  })

  if (metadata.hasAlpha) {
    const output = await resized.webp({ quality: 85 }).toBuffer()
    return { buffer: output, contentType: 'image/webp', extension: 'webp' }
  }

  const output = await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  return { buffer: output, contentType: 'image/jpeg', extension: 'jpg' }
}
