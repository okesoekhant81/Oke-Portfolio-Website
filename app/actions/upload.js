'use server'

import { put } from '@vercel/blob'
import { optimizeImage } from '../../lib/optimizeImage'
import { slugify } from '../../lib/slugify'

export async function uploadImage(file) {
  if (!file || typeof file === 'string' || file.size === 0) {
    return { error: 'No file selected.' }
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: 'Image storage is not connected yet (missing Blob token).' }
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const { buffer, contentType, extension } = await optimizeImage(inputBuffer)

    const baseName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image'
    const pathname = `images/${baseName}.${extension}`

    const blob = await put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    })
    return { url: blob.url, originalSize: inputBuffer.length, optimizedSize: buffer.length }
  } catch {
    return { error: 'Upload failed. Please try again.' }
  }
}
