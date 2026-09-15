'use server'

import { readJson, writeJson, deleteJson } from '../../lib/blobStore'
import { logActivity } from '../../lib/activityLog'

const INDEX_PATH = 'content/posts-index.json'
const postPath = (slug) => `content/posts/${slug}.json`
const ALL_POSTS_PATH = 'content/posts-all.json'

// One-time, non-destructive copy: reads every post out of the current
// one-file-per-post storage (content/posts-index.json + a
// content/posts/{slug}.json per post — the source of getPosts()'s N+1 Blob
// read pattern on every public page load) and writes them, in the same
// append order the index already keeps, into a single array file
// (content/posts-all.json).
//
// Doesn't touch or delete anything the old storage shape depends on —
// lib/content/posts.js keeps reading/writing the old shape until this has
// been run and verified in production, and the code is cut over to the new
// file in a separate, later change. Safe to re-run: each run just
// overwrites content/posts-all.json with a fresh copy, so nothing is lost
// by running it more than once before cutover.
export async function migratePostsToSingleFileAction() {
  const slugs = (await readJson(INDEX_PATH)) || []
  const posts = await Promise.all(slugs.map((slug) => readJson(postPath(slug))))

  const missingSlugs = slugs.filter((slug, i) => !posts[i])
  const found = posts.filter(Boolean)

  await writeJson(ALL_POSTS_PATH, found)
  await logActivity('Posts migrated to single-file storage (non-destructive copy)', `${found.length} posts`)

  return {
    indexedSlugCount: slugs.length,
    migratedCount: found.length,
    missingSlugs,
  }
}

// The final step, once the cutover in lib/content/posts.js has shipped and
// been verified in production — deletes the old index and every old
// per-post file the site no longer reads or writes. Only reachable from the
// confirm-gated button on /admin/backup. Not run automatically: unlike the
// copy above, this one is destructive and has no "safe to re-run" story
// once the old files are gone.
export async function cleanupOldPostFilesAction() {
  const slugs = (await readJson(INDEX_PATH)) || []
  await Promise.all(slugs.map((slug) => deleteJson(postPath(slug))))
  await deleteJson(INDEX_PATH)

  await logActivity('Old per-post storage cleaned up', `${slugs.length} post files + index`)
  return { deletedCount: slugs.length }
}
