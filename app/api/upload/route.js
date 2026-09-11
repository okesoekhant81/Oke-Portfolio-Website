import { NextResponse } from 'next/server'
import { SESSION_COOKIE, isValidSessionToken } from '../../../lib/auth'
import { uploadImageToBlob } from '../../../lib/uploadImage'

// A plain fetch()/XHR endpoint rather than a Server Action so the client can
// track real upload progress via XMLHttpRequest — Server Actions don't
// expose that. Not covered by proxy.js's /admin/:path* matcher, so the
// admin session is checked here instead.
export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!(await isValidSessionToken(token))) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Image storage is not connected yet (missing Blob token).' }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file || typeof file === 'string' || file.size === 0) {
    return NextResponse.json({ error: 'No file selected.' }, { status: 400 })
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadImageToBlob(inputBuffer, file.name)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
