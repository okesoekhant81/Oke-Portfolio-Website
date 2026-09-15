'use server'

import { listAllBlobs } from '../../lib/blobStore'
import { collectImageUrls } from '../../lib/imageCleanup'
import { getHomepageContent } from '../../lib/content/homepage'
import { getWorkshopContent } from '../../lib/content/workshop'
import { getPosts } from '../../lib/content/posts'
import { getTestimonials } from '../../lib/content/testimonials'
import { getStudents } from '../../lib/content/students'
import { getInquiries } from '../../lib/content/inquiries'

// Read-only — lists every blob actually sitting under images/ and every
// image URL referenced anywhere in content (including drafts, trashed
// records, and unpublished posts, since those still legitimately reference
// an image that shouldn't be reported as orphaned), then reports whatever
// isn't referenced anywhere. Never deletes anything — this is the diagnosis
// step, cleanup is a separate, explicitly-confirmed action.
export async function getOrphanedImagesReportAction() {
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
  const orphanedBytes = orphaned.reduce((sum, blob) => sum + blob.size, 0)

  return {
    totalCount: blobs.length,
    totalBytes,
    orphanedCount: orphaned.length,
    orphanedBytes,
    orphaned,
    generatedAt: Date.now(),
  }
}
