'use client'

import { useState } from 'react'
import { getRawStorageSnapshotAction, migrateStorageToPrivateAction } from '../../app/actions/storageMigration'

const STATUS_LABEL = {
  copied: 'Copied',
  'skipped-not-found': 'Not found (skipped)',
  mismatch: 'Mismatch — retry',
  error: 'Error',
}

const STATUS_COLOR = {
  copied: 'text-green-700',
  'skipped-not-found': 'text-neutral-400',
  mismatch: 'text-red-600',
  error: 'text-red-600',
}

export default function StorageMigrationPanel() {
  const [snapshotState, setSnapshotState] = useState('idle') // idle | working | done | error
  const [migrateState, setMigrateState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)

  async function handleSnapshot() {
    setSnapshotState('working')
    try {
      const data = await getRawStorageSnapshotAction()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `storage-snapshot-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setSnapshotState('done')
    } catch {
      setSnapshotState('error')
    }
  }

  async function handleMigrate() {
    setMigrateState('working')
    setReport(null)
    try {
      const result = await migrateStorageToPrivateAction()
      setReport(result.report)
      setMigrateState('idle')
    } catch {
      setMigrateState('error')
    }
  }

  const hasProblems = report?.some((r) => r.status === 'mismatch' || r.status === 'error')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-medium text-ink">Step 1 — Download a raw storage snapshot</h2>
        <p className="mt-1 text-sm text-neutral-500">
          An exact, unfiltered dump of every file this app stores (including anything soft-deleted). Save it
          somewhere safe before doing anything below.
        </p>
        <button
          type="button"
          onClick={handleSnapshot}
          disabled={snapshotState === 'working'}
          className="mt-3 rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
        >
          {snapshotState === 'working' ? 'Preparing…' : 'Download raw storage snapshot'}
        </button>
        {snapshotState === 'error' && <p className="mt-2 text-sm text-red-600">Could not build the snapshot. Please try again.</p>}
        {snapshotState === 'done' && <p className="mt-2 text-sm text-green-700">Downloaded. Keep it somewhere safe.</p>}
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <h2 className="font-medium text-ink">Step 2 — Copy data to private storage</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Copies every file to a new, non-public location. This does not touch or delete anything — the site keeps
          reading and writing the existing copies exactly as before until a separate code change switches it over.
          Safe to run more than once.
        </p>
        <button
          type="button"
          onClick={handleMigrate}
          disabled={migrateState === 'working' || snapshotState !== 'done'}
          className="mt-3 rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {migrateState === 'working' ? 'Copying…' : 'Copy all data to private storage'}
        </button>
        {snapshotState !== 'done' && (
          <p className="mt-2 text-xs text-neutral-400">Download the snapshot above first.</p>
        )}
        {migrateState === 'error' && <p className="mt-2 text-sm text-red-600">Could not run the copy. Please try again.</p>}

        {report && (
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Path</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.pathname} className="border-t border-neutral-100">
                    <td className="px-3 py-2 font-mono text-xs">{row.pathname}</td>
                    <td className={`px-3 py-2 ${STATUS_COLOR[row.status] || 'text-neutral-500'}`}>
                      {STATUS_LABEL[row.status] || row.status}
                      {row.error ? `: ${row.error}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={`px-3 py-2 text-xs ${hasProblems ? 'text-red-600' : 'text-green-700'}`}>
              {hasProblems
                ? 'Some files did not copy cleanly — re-run this step. Nothing has changed on the live site yet either way.'
                : 'All files copied and verified. Share this with Claude to move on to the next step.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
