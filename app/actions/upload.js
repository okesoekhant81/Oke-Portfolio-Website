'use server'

import { put } from '@vercel/blob'

export async function uploadImage(file) {
  if (!file || typeof file === 'string' || file.size === 0) {
    return { error: 'No file selected.' }
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: 'Image storage is not connected yet (missing Blob token).' }
  }

  try {
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true })
    return { url: blob.url }
  } catch {
    return { error: 'Upload failed. Please try again.' }
  }
}
