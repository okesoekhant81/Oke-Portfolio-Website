import { get, put, del, BlobPreconditionFailedError } from '@vercel/blob'

export const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

// Vercel Blob is an object store, not a key-value store, but `get` with a
// stable pathname (no random suffix) and `useCache: false` behaves like one
// closely enough for our needs — no separate database required.

async function readJsonWithEtag(pathname) {
  try {
    const result = await get(pathname, { access: 'public', useCache: false })
    if (!result || result.statusCode !== 200) return { data: null, etag: null }
    const text = await new Response(result.stream).text()
    return { data: JSON.parse(text), etag: result.etag }
  } catch {
    return { data: null, etag: null }
  }
}

export async function readJson(pathname) {
  if (!isBlobConfigured) return null
  const { data } = await readJsonWithEtag(pathname)
  return data
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

// Plain read-then-write (writeJson above) loses updates when two requests
// touch the same file close together — e.g. an admin deleting one inquiry
// while another status change (or a new public registration) is still
// mid-write: whichever write lands second wins outright and silently
// undoes the first. This does the same read/modify/write but with the
// blob's ETag as a compare-and-swap guard, so a write that landed on stale
// data gets rejected (BlobPreconditionFailedError) instead of clobbering
// the other change — and retries against the now-current data instead of
// failing the request.
//
// `updateFn` receives the current parsed value (null if the blob doesn't
// exist yet) and returns the next value to store.
export async function mutateJson(pathname, updateFn, { retries = 3 } = {}) {
  if (!isBlobConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel Blob store first.')
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { data, etag } = await readJsonWithEtag(pathname)
    const next = await updateFn(data)
    try {
      await put(pathname, JSON.stringify(next), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        ...(etag ? { ifMatch: etag } : {}),
      })
      return next
    } catch (err) {
      const isConflict = err instanceof BlobPreconditionFailedError
      if (!isConflict || attempt === retries) throw err
      // Someone else wrote in between — loop back and retry against
      // whatever is there now.
    }
  }
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
