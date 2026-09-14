'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { LockContext } from './ContentFormFields'
import { listMediaAction } from '../../app/actions/media'

function formatKb(bytes) {
  return `${Math.max(1, Math.round(bytes / 1024))}KB`
}

// XMLHttpRequest (not fetch) so we get real upload-progress events — the
// upload itself can take a while on a slow connection, and once all bytes
// are sent the server still has to run sharp + write to Blob, which reads
// as a dead pause without a distinct "optimizing" state.
function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.upload.onload = () => onProgress(100)

    xhr.onload = () => {
      let body
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        body = { error: 'Upload failed. Please try again.' }
      }
      if (xhr.status === 200 && body.url) resolve(body)
      else reject(new Error(body.error || 'Upload failed. Please try again.'))
    }
    xhr.onerror = () => reject(new Error('Upload failed. Please try again.'))

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

// Fetched fresh each time the picker opens rather than cached across the
// whole admin session — a teammate (or this same admin, in another tab)
// could have uploaded something new since the page loaded.
function MediaLibraryPicker({ onSelect, onClose }) {
  const [images, setImages] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listMediaAction()
      .then(setImages)
      .catch(() => setError('Could not load the library.'))
  }, [])

  return (
    <div className="mt-2 rounded-md border border-neutral-200 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-neutral-500">Choose from library</p>
        <button type="button" onClick={onClose} className="text-xs text-neutral-400 hover:text-ink">
          Close
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {images === null && !error && <p className="mt-2 text-xs text-neutral-400">Loading…</p>}
      {images?.length === 0 && <p className="mt-2 text-xs text-neutral-400">No images uploaded yet.</p>}
      {images && images.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => onSelect(img.url)}
              className="aspect-square overflow-hidden rounded-md border border-neutral-200 transition-colors hover:border-brand"
            >
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ImageField({ name, label, defaultValue }) {
  const locked = useContext(LockContext)
  const [url, setUrl] = useState(defaultValue || '')
  const [phase, setPhase] = useState('idle') // idle | uploading | optimizing | done | error
  const [percent, setPercent] = useState(0)
  const [message, setMessage] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)
  const inputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhase('uploading')
    setPercent(0)

    try {
      const result = await uploadWithProgress(file, (pct) => {
        setPercent(pct)
        if (pct >= 100) setPhase('optimizing')
      })
      setUrl(result.url)
      setMessage(`Optimized: ${formatKb(result.originalSize)} → ${formatKb(result.optimizedSize)}`)
      setPhase('done')
    } catch (err) {
      setMessage(err.message)
      setPhase('error')
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  function handleLibrarySelect(selectedUrl) {
    setUrl(selectedUrl)
    setPhase('idle')
    setShowLibrary(false)
  }

  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {url ? (
          <img src={url} alt="" className="h-20 w-20 shrink-0 rounded-md border border-neutral-200 object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-neutral-300 text-[10px] text-neutral-400">
            No image
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={locked}
              className="text-xs disabled:cursor-default disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowLibrary((v) => !v)}
              disabled={locked}
              className="text-xs text-brand hover:underline disabled:cursor-default disabled:text-neutral-400 disabled:no-underline"
            >
              {showLibrary ? 'Hide library' : 'Choose from library'}
            </button>
          </div>

          {(phase === 'uploading' || phase === 'optimizing') && (
            <div className="mt-2 max-w-48">
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                {phase === 'uploading' ? (
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-200 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                ) : (
                  <div className="h-full w-full animate-pulse rounded-full bg-brand" />
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                {phase === 'uploading' ? `Uploading… ${percent}%` : 'Optimizing image…'}
              </p>
            </div>
          )}

          {phase === 'done' && <p className="mt-1 text-xs text-neutral-400">{message}</p>}
          {phase === 'error' && <p className="mt-1 text-xs text-red-600">{message}</p>}

          {showLibrary && !locked && (
            <MediaLibraryPicker onSelect={handleLibrarySelect} onClose={() => setShowLibrary(false)} />
          )}
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  )
}
