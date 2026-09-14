import { NextResponse } from 'next/server'
import { uploadImageToBlob } from '../../../lib/uploadImage'
import { checkSubmissionLimit, recordSubmission } from '../../../lib/submissionLimits'
import { clientIp } from '../../../lib/clientIp'

const MAX_BYTES = 8 * 1024 * 1024

// Public and unauthenticated, unlike /api/upload (admin-only) — a
// registrant uploads their payment screenshot before an admin session
// exists for them. Same per-IP sliding-window limit as the other public
// forms (see lib/submissionLimits.js) rather than a session check, since
// that's the only thing standing between this and an open file-upload
// endpoint.
export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Image storage is not connected yet.' }, { status: 500 })
  }

  const ip = await clientIp()
  const { limited, retryAfterSeconds } = await checkSubmissionLimit('payment-proof-uploads', ip)
  if (limited) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    return NextResponse.json({ error: `Too many uploads. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }, { status: 429 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file || typeof file === 'string' || file.size === 0) {
    return NextResponse.json({ error: 'No file selected.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File is too large (max 8MB).' }, { status: 400 })
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadImageToBlob(inputBuffer, file.name)
    await recordSubmission('payment-proof-uploads', ip)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Upload failed — please make sure it’s an image, then try again.' }, { status: 500 })
  }
}
