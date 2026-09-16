'use server'

import { readJson, writeJson, deleteJson } from '../../lib/blobStore'
import { logActivity } from '../../lib/activityLog'

const ALL_POSTS_PATH = 'content/posts-all.json'
const LIST_PATH = 'content/posts-list.json'
const postPath = (slug) => `content/posts/${slug}.json`

// The fields a list view (blog list, homepage, sitemap, RSS, related
// articles) actually needs — never the body, so listing posts never has to
// download every article's full text. See lib/content/posts.js's split
// storage design for why this exists.
const SUMMARY_FIELDS = ['slug', 'title', 'titleMy', 'excerpt', 'excerptMy', 'coverImageUrl', 'tags', 'publishedAt', 'status', 'deletedAt']

function toSummary(post) {
  const summary = {}
  for (const field of SUMMARY_FIELDS) summary[field] = post[field]
  return summary
}

// One-time, non-destructive copy: splits the single-file posts-all.json
// (see lib/content/posts.js) into a lightweight list-summary file plus one
// full-content file per post. Fixes a regression the single-file design
// introduced — saving any one post made Vercel Blob's CDN cache treat
// *every* post as stale for up to a minute (the whole site's worth of
// articles shared that one file), where the original one-file-per-post
// design only ever staled the post actually being edited. Splitting list
// metadata (small, read by every page) from full body content (large, read
// one post at a time) keeps getPosts()'s single-read win while narrowing
// the staleness blast radius back down to just the post being saved.
//
// Doesn't touch or delete posts-all.json — lib/content/posts.js keeps
// reading/writing it until this has been run and verified, and the code is
// cut over to the split shape in a separate, later change. Safe to re-run.
export async function migratePostsToSplitStorageAction() {
  const posts = (await readJson(ALL_POSTS_PATH)) || []

  await Promise.all(posts.map((post) => writeJson(postPath(post.slug), post)))
  await writeJson(LIST_PATH, posts.map(toSummary))

  await logActivity('Posts migrated to split storage (non-destructive copy)', `${posts.length} posts`)

  return { migratedCount: posts.length }
}

// The final step, once the cutover in lib/content/posts.js has shipped and
// been verified in production — deletes the old single-file posts-all.json,
// which the site no longer reads or writes. Only reachable from the
// confirm-gated button on /admin/backup. Not run automatically, unlike the
// copy above: this one is destructive.
export async function cleanupOldPostsFileAction() {
  await deleteJson(ALL_POSTS_PATH)
  await logActivity('Old single-file posts storage cleaned up', 'content/posts-all.json')
  return { deleted: true }
}
