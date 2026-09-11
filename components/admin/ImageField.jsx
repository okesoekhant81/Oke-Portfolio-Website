'use client'

import { useRef, useState } from 'react'

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

export default function ImageField({ name, label, defaultValue }) {
  const [url, setUrl] = useState(defaultValue || '')
  const [phase, setPhase] = useState('idle') // idle | uploading | optimizing | done | error
  const [percent, setPercent] = useState(0)
  const [message, setMessage] = useState('')
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

  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        {url ? (
          <img src={url} alt="" className="h-20 w-20 rounded-md border border-neutral-200 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-neutral-300 text-[10px] text-neutral-400">
            No image
          </div>
        )}
        <div className="flex-1">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />

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
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  )
}
