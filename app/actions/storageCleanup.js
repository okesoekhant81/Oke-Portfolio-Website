'use server'

import { deleteJsonRaw } from '../../lib/blobStore'
import { allContentPaths } from '../../lib/contentPaths'

// The actual fix, not just cleanup: the migration (now removed — see the
// git history for app/actions/storageMigration.js) copied every content
// pathname onto a BLOB_PATH_SECRET-prefixed location, and lib/blobStore.js
// has been reading/writing exclusively through that prefix since. But the
// original plain-path copies (content/students.json, content/inquiries.json,
// ...) were deliberately left in place as a rollback path until the cutover
// was confirmed working in production. Until this runs, those old copies
// are still sitting at their guessable URLs, still world-readable — the
// exposure this whole migration exists to close isn't actually closed
// until they're gone.
//
// allContentPaths() reads content/posts-index.json through blobStore.js,
// which now resolves that through securedPath() — so this enumerates
// today's live set of pathnames, the same ones the migration copied.
export async function cleanupPlainPathsAction() {
  const paths = await allContentPaths()
  const report = []
  for (const pathname of paths) {
    try {
      await deleteJsonRaw(pathname)
      report.push({ pathname, status: 'deleted' })
    } catch (err) {
      report.push({ pathname, status: 'error', error: err.message || String(err) })
    }
  }
  return { cleanedAt: new Date().toISOString(), report }
}
