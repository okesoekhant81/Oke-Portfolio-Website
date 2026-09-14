'use server'

import { readJsonRaw, writeJsonRaw } from '../../lib/blobStore'
import { allContentPaths } from '../../lib/contentPaths'

// Every content pathname (content/students.json, content/inquiries.json,
// content/admin-users.json, ...) is a fixed, guessable name in a store
// that's otherwise public — and the store's own hostname isn't secret
// either, since it's right there in every uploaded image's URL on the
// public site. So anyone who bothers to guess these exact names can read
// student/inquiry data directly, with no admin login involved at all.
//
// Vercel's store here is public-only (see lib/blobStore.js's CACHE_MAX_AGE
// comment — private access isn't available), so the fix isn't real access
// control, it's making the pathname itself unguessable: everything moves
// under a long random prefix (BLOB_PATH_SECRET, set as a Vercel env var,
// never committed to the repo) that nobody outside the project can know or
// brute-force. Same store, same public access — just a name nobody can
// guess.
//
// This action only *copies* — it reads each pathname from its current
// plain location and writes an identical copy under the secured prefix,
// verifying each one, and never touches or deletes the plain-path
// original. The app keeps reading/writing the plain paths until a separate
// follow-up change switches it over (see lib/blobStore.js), so running
// this changes nothing about what the live site does. Safe to re-run.
export async function migrateStorageToSecuredPathsAction() {
  const secret = process.env.BLOB_PATH_SECRET
  if (!secret) {
    return { error: 'BLOB_PATH_SECRET is not set. Add it in the Vercel project settings and redeploy first.' }
  }

  const paths = await allContentPaths()
  const report = []
  for (const pathname of paths) {
    const text = await readJsonRaw(pathname)
    if (text === null) {
      report.push({ pathname, status: 'skipped-not-found' })
      continue
    }
    const target = `${secret}/${pathname}`
    try {
      await writeJsonRaw(target, text)
      const verify = await readJsonRaw(target)
      report.push({ pathname, target, status: verify === text ? 'copied' : 'mismatch', bytes: text.length })
    } catch (err) {
      report.push({ pathname, target, status: 'error', error: err.message || String(err) })
    }
  }
  return { migratedAt: new Date().toISOString(), report }
}
