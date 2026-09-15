'use server'

import { revalidatePath } from 'next/cache'
import { listAllBlobs, deleteBlobByUrl } from '../../lib/blobStore'
import { collectImageUrls } from '../../lib/imageCleanup'
import { getHomepageContent } from '../../lib/content/homepage'
import { getWorkshopContent } from '../../lib/content/workshop'
import { getPosts } from '../../lib/content/posts'
import { getTestimonials } from '../../lib/content/testimonials'
import { getStudents } from '../../lib/content/students'
import { getInquiries } from '../../lib/content/inquiries'
import { logActivity } from '../../lib/activityLog'

// Shared by both the read-only report and the delete action below, so a
// delete always re-derives its own fresh orphan list server-side rather than
// trusting whatever the client last rendered — anything that became
// referenced between the scan and the click (e.g. someone re-uploading a
// draft's cover image in another tab) is excluded automatically.
async function findOrphanedImages() {
  const [blobs, homepage, workshop, posts, testimonials, students, inquiries] = await Promise.all([
    listAllBlobs('images/'),
    getHomepageContent(),
    getWorkshopContent(),
    getPosts({ includeUnpublished: true, includeDeleted: true }),
    getTestimonials({ includeDeleted: true }),
    getStudents({ includeDeleted: true }),
    getInquiries(),
  ])

  const referenced = collectImageUrls([homepage, workshop, posts, testimonials, students, inquiries])

  const orphaned = blobs
    .filter((blob) => !referenced.has(blob.url))
    .map((blob) => ({ url: blob.url, pathname: blob.pathname, size: blob.size, uploadedAt: blob.uploadedAt }))
    .sort((a, b) => b.size - a.size)

  const totalBytes = blobs.reduce((sum, blob) => sum + blob.size, 0)

  return { totalCount: blobs.length, totalBytes, orphaned }
}

// Read-only — lists every blob actually sitting under images/ and every
// image URL referenced anywhere in content (including drafts, trashed
// records, and unpublished posts, since those still legitimately reference
// an image that shouldn't be reported as orphaned), then reports whatever
// isn't referenced anywhere. Never deletes anything — this is the diagnosis
// step, cleanup is a separate, explicitly-confirmed action.
export async function getOrphanedImagesReportAction() {
  const { totalCount, totalBytes, orphaned } = await findOrphanedImages()
  const orphanedBytes = orphaned.reduce((sum, blob) => sum + blob.size, 0)

  return {
    totalCount,
    totalBytes,
    orphanedCount: orphaned.length,
    orphanedBytes,
    orphaned,
    generatedAt: Date.now(),
  }
}

// The confirmed cleanup step — only reachable from the "Delete all
// orphaned images" button on /admin/backup, gated behind the in-app confirm
// dialog. Re-runs the same cross-reference fresh (see findOrphanedImages)
// rather than deleting whatever URL list the client happens to be holding.
export async function deleteOrphanedImagesAction() {
  const { orphaned } = await findOrphanedImages()

  await Promise.all(orphaned.map((blob) => deleteBlobByUrl(blob.url)))

  const deletedBytes = orphaned.reduce((sum, blob) => sum + blob.size, 0)
  await logActivity('Orphaned images deleted', `${orphaned.length} images, ${deletedBytes} bytes`)
  revalidatePath('/admin/backup')

  return { deletedCount: orphaned.length, deletedBytes }
}
