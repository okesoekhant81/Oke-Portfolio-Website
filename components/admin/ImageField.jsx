'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '../../app/actions/upload'

export default function ImageField({ name, label, defaultValue }) {
  const [url, setUrl] = useState(defaultValue || '')
  const [status, setStatus] = useState('idle')
  const inputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('uploading')
    const result = await uploadImage(file)
    if (result.url) {
      setUrl(result.url)
      setStatus('idle')
    } else {
      setStatus(result.error || 'Upload failed.')
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
        <div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />
          <p className="mt-1 text-xs text-neutral-400">
            {status === 'uploading' ? 'Uploading…' : status !== 'idle' ? status : ' '}
          </p>
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  )
}
