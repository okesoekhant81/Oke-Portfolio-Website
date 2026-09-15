'use client'

import { useState } from 'react'
import { getOrphanedImagesReportAction } from '../../app/actions/imageReport'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

// Read-only diagnostic tool — lists every uploaded image Blob that's no
// longer referenced by any content (homepage, workshop, posts, testimonials,
// students, inquiries), so it's safe to run any time. It does NOT delete
// anything; that's a deliberately separate, explicitly-confirmed step once
// this list has actually been reviewed.
export default function OrphanedImagesReport() {
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)

  async function handleClick() {
    setState('working')
    try {
      setReport(await getOrphanedImagesReportAction())
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Scanning…' : 'Scan for orphaned images'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not build the report. Please try again.</p>}

      {report && (
        <div className="mt-4">
          <p className="text-sm text-neutral-700">
            {report.totalCount} images total ({formatBytes(report.totalBytes)}) —{' '}
            <span className="font-medium text-ink">
              {report.orphanedCount} unreferenced ({formatBytes(report.orphanedBytes)})
            </span>
          </p>
          {report.orphaned.length > 0 && (
            <div className="mt-3 max-h-96 overflow-y-auto rounded-md border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Image</th>
                    <th className="px-3 py-2 font-medium">Size</th>
                    <th className="px-3 py-2 font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {report.orphaned.map((img) => (
                    <tr key={img.url} className="border-t border-neutral-100">
                      <td className="px-3 py-2">
                        <a href={img.url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                          {img.pathname.replace(/^images\//, '')}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-neutral-500">{formatBytes(img.size)}</td>
                      <td className="px-3 py-2 text-neutral-500">{new Date(img.uploadedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
