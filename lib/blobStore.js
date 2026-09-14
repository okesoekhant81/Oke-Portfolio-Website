import { get, put, del, list, BlobPreconditionFailedError } from '@vercel/blob'

export const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN) && Boolean(process.env.BLOB_PATH_SECRET)

// Vercel Blob is an object store, not a key-value store, but `get` with a
// stable pathname (no random suffix) behaves like one closely enough for our
// needs — no separate database required.

// `useCache: false` on get() below does NOT bypass Vercel's CDN cache here.
// The SDK only applies that cache-busting when access is 'private', and
// Vercel's CDN doesn't support the bypass for public blobs at all — this is
// a deliberate platform limitation (see the useCache doc comment on
// PresignGetUrlOptions in node_modules/@vercel/blob/dist/create-folder-*.d.ts:
// "The CDN only supports the bypass for private blobs, so it's ignored for
// public ones"), not something a request header or query param can work
// around. Switching this store's blobs to private access isn't available
// either — this project's Blob store is provisioned as a public store, and
// Vercel rejects private-access reads/writes against it outright ("Cannot
// use private access on a public store"). A genuinely uncached read would
// need a *second*, separately-provisioned private store (new store, new
// token, and public assets like uploaded images would still need to stay on
// the public one, since those are fetched directly by the browser) — a
// bigger migration than this fix, left for later if ever needed.
//
// So CACHE_MAX_AGE below is the realistic ceiling for this store: it caps
// how stale a read can be at the lowest value @vercel/blob's put() accepts
// (1 minute), which is far better than the SDK's own 1-month default that
// every write here previously left unset, and bounds the "delete/edit
// doesn't show up until a refresh (or several)" staleness window to at most
// a minute instead of up to a month.
const CACHE_MAX_AGE = 60

// Content pathnames (content/students.json, content/admin-users.json, ...)
// are otherwise fixed, guessable names in a store that's public — and the
// store's own hostname isn't secret either, since it's right there in every
// uploaded image's public URL. Every content read/write below is scoped
// under BLOB_PATH_SECRET (a long random string, set as a Vercel env var,
// never committed) so the real pathname isn't something anyone outside the
// project can guess. Everything in lib/content/*.js still passes the same
// plain pathnames it always has — this is the only place that needs to
// know about the prefix.
function securedPath(pathname) {
  const secret = process.env.BLOB_PATH_SECRET
  if (!secret) {
    throw new Error('BLOB_PATH_SECRET is not set — connect a Vercel Blob store and set it first.')
  }
  return `${secret}/${pathname}`
}

async function readJsonWithEtag(pathname) {
  try {
    const result = await get(securedPath(pathname), { access: 'public', useCache: false })
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
  await put(securedPath(pathname), JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: CACHE_MAX_AGE,
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
//
// retries defaults higher than it sounds like it needs to (8, not 3):
// taking attendance for a whole class one student at a time fires one of
// these per student in quick succession, all against the same file, so a
// real burst is more like 15-20 concurrent writers, not 2-3 — with a low
// retry count under that much contention, several genuinely lose every
// attempt and throw, which upstream code has to actually surface (never
// silently swallow) or the write just looks like it vanished. The jittered
// backoff spreads retries out so concurrent losers don't immediately
// collide with each other a second time.
export async function mutateJson(pathname, updateFn, { retries = 8 } = {}) {
  if (!isBlobConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel Blob store first.')
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { data, etag } = await readJsonWithEtag(pathname)
    const next = await updateFn(data)
    try {
      await put(securedPath(pathname), JSON.stringify(next), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: CACHE_MAX_AGE,
        ...(etag ? { ifMatch: etag } : {}),
      })
      return next
    } catch (err) {
      const isConflict = err instanceof BlobPreconditionFailedError
      if (!isConflict || attempt === retries) throw err
      // Someone else wrote in between — back off a little (more so on
      // later attempts) so retrying writers don't all collide again on
      // the very next attempt, then loop back and retry against whatever
      // is there now.
      const backoffMs = 50 * attempt + Math.random() * 100
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }
}

export async function deleteJson(pathname) {
  if (!isBlobConfigured) {
    throw new Error('Storage is not connected yet — connect a Vercel Blob store first.')
  }
  try {
    await del(securedPath(pathname))
  } catch {
    // Already gone — fine.
  }
}

// Backs the admin media library picker (see ImageField.jsx) — every
// uploaded image already lives under images/ (see lib/uploadImage.js), so
// this is read-only browsing of what's already there, not a new store.
// Images are unaffected by securedPath above: they're meant to be publicly
// fetchable by the browser (hero photo, post covers), and already get a
// random suffix from Vercel at upload time, so their URLs aren't guessable
// the way a fixed content pathname was.
export async function listBlobs(prefix) {
  if (!isBlobConfigured) return []
  const { blobs } = await list({ prefix, limit: 100 })
  return blobs
}

// Only for the raw storage snapshot (see getRawStorageSnapshotAction in
// app/actions/backup.js) — the exact text of a blob, with no JSON
// parse/reserialize round-trip and no business-logic filtering (soft-
// deleted records, drafts, etc. all included), so the snapshot is a true
// byte-for-byte dump of what's actually stored.
export async function readJsonRaw(pathname) {
  if (!isBlobConfigured) return null
  try {
    const result = await get(securedPath(pathname), { access: 'public', useCache: false })
    if (!result || result.statusCode !== 200) return null
    return await new Response(result.stream).text()
  } catch {
    return null
  }
}

// Only for the one-time cleanup of the legacy, unsecured plain-path copies
// left behind by the securedPath migration (see
// app/actions/storageCleanup.js) — deletes an exact pathname with no
// securedPath prefix applied, unlike deleteJson above. Deliberately
// separate from deleteJson so nothing else in this file can ever delete an
// unprefixed path by accident.
export async function deleteJsonRaw(pathname) {
  if (!isBlobConfigured) return
  try {
    await del(pathname)
  } catch {
    // Already gone — fine.
  }
}
