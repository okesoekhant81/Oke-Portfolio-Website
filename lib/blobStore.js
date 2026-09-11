import { get, put, del } from '@vercel/blob'

export const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

// Vercel Blob is an object store, not a key-value store, but `get` with a
// stable pathname (no random suffix) and `useCache: false` behaves like one
// closely enough for our needs — no separate database required.

export async function readJson(pathname) {
  if (!isBlobConfigured) return null
  try {
    const result = await get(pathname, { access: 'public', useCache: false })
    if (!result || result.statusCode !== 200) return null
    const text = await new Response(result.stream).text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function writeJson(pathname, data) {
  if (!isBlobConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel Blob store first.')
  }
  await put(pathname, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export async function deleteJson(pathname) {
  if (!isBlobConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel Blob store first.')
  }
  try {
    await del(pathname)
  } catch {
    // Already gone — fine.
  }
}
