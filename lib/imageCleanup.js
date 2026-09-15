import { deleteBlobByUrl } from './blobStore'

// Matches any uploaded image URL (see lib/uploadImage.js's `images/`
// pathname) regardless of which store the URL happens to point at —
// deliberately loose on the hostname, tight on the /images/ path, since
// that's the one thing every real upload shares and nothing else in this
// app's URLs does.
const IMAGE_URL_RE = /^https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\/images\//

// Exported for app/actions/imageReport.js, which needs the raw URL set
// (not a diff) across every content type at once to find what's referenced
// nowhere at all.
export function collectImageUrls(value, out = new Set()) {
  if (typeof value === 'string') {
    if (IMAGE_URL_RE.test(value)) out.add(value)
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectImageUrls(v, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectImageUrls(v, out))
  }
  return out
}

// Diffs two versions of the same content record (before/after a save) and
// deletes any uploaded image that was referenced in `oldContent` but isn't
// referenced anywhere in `newContent` anymore. Works generically across
// every content shape in this app (top-level fields like heroImage,
// nested arrays like paymentMethods[].qrImage or services[].image) rather
// than needing a field list per content type — ImageField lets an admin
// swap any of these freely, and without this, replacing an image used to
// just orphan the old blob forever since nothing ever deleted it.
//
// Safe to call with oldContent === null/undefined (nothing to clean up
// yet, e.g. the very first save) — collectImageUrls on nothing just
// yields an empty set.
export async function cleanupReplacedImages(oldContent, newContent) {
  const oldUrls = collectImageUrls(oldContent)
  const newUrls = collectImageUrls(newContent)
  const removed = [...oldUrls].filter((url) => !newUrls.has(url))
  await Promise.all(removed.map((url) => deleteBlobByUrl(url)))
}

// For a record being permanently removed entirely (a post, testimonial,
// student deleted from Trash) — every image it references should go with
// it, not just the ones that changed.
export async function cleanupAllImages(content) {
  const urls = collectImageUrls(content)
  await Promise.all([...urls].map((url) => deleteBlobByUrl(url)))
}
