import { put } from '@vercel/blob'
import { optimizeImage } from './optimizeImage'
import { slugify } from './slugify'

export async function uploadImageToBlob(inputBuffer, filename) {
  const { buffer, contentType, extension } = await optimizeImage(inputBuffer)

  const baseName = slugify(filename.replace(/\.[^.]+$/, '')) || 'image'
  const pathname = `images/${baseName}.${extension}`

  const blob = await put(pathname, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
  })

  return { url: blob.url, originalSize: inputBuffer.length, optimizedSize: buffer.length }
}
