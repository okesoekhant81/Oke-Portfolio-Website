'use server'

import { getHomepageContent } from '../../lib/content/homepage'
import { getAboutContent } from '../../lib/content/about'
import { getWorkshopContent } from '../../lib/content/workshop'
import { getPosts } from '../../lib/content/posts'
import { getTestimonials } from '../../lib/content/testimonials'
import { getClassDates } from '../../lib/content/classDates'
import { getStudents } from '../../lib/content/students'
import { getInquiries } from '../../lib/content/inquiries'
import { getSubscribers } from '../../lib/content/newsletter'
import { getAnalytics, getPostLikes } from '../../lib/content/analytics'

// Everything the admin panel manages, gathered into one snapshot — a plain
// data export, not a restore mechanism (there's no matching "import" on
// the other end). Meant to sit somewhere safe in case the Blob store is
// ever lost or corrupted, not to be re-uploaded anywhere.
export async function getFullBackupAction() {
  const [
    homepage,
    about,
    workshop,
    posts,
    testimonials,
    classDates,
    students,
    inquiries,
    newsletterSubscribers,
    analytics,
    postLikes,
  ] = await Promise.all([
    getHomepageContent(),
    getAboutContent(),
    getWorkshopContent(),
    getPosts({ includeUnpublished: true }),
    getTestimonials(),
    getClassDates(),
    getStudents(),
    getInquiries(),
    getSubscribers(),
    getAnalytics(),
    getPostLikes(),
  ])

  return {
    exportedAt: new Date().toISOString(),
    homepage,
    about,
    workshop,
    posts,
    testimonials,
    classDates,
    students,
    inquiries,
    newsletterSubscribers,
    analytics,
    postLikes,
  }
}
