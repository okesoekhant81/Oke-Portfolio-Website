'use client'

import { useState } from 'react'
import { getFullBackupAction, getRawStorageSnapshotAction } from '../../app/actions/backup'

function download(data, filenamePrefix) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function BackupButton() {
  const [state, setState] = useState('idle') // idle | working | error
  const [rawState, setRawState] = useState('idle')

  async function handleClick() {
    setState('working')
    try {
      download(await getFullBackupAction(), 'backup')
      setState('idle')
    } catch {
      setState('error')
    }
  }

  async function handleRawClick() {
    setRawState('working')
    try {
      download(await getRawStorageSnapshotAction(), 'storage-snapshot')
      setRawState('idle')
    } catch {
      setRawState('error')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={handleClick}
          disabled={state === 'working'}
          className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {state === 'working' ? 'Preparing…' : 'Download full backup'}
        </button>
        {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not build the backup. Please try again.</p>}
      </div>
      <div className="border-t border-neutral-200 pt-4">
        <p className="mb-2 text-xs text-neutral-500">
          A more literal snapshot — every stored file exactly as it is, including anything soft-deleted.
        </p>
        <button
          type="button"
          onClick={handleRawClick}
          disabled={rawState === 'working'}
          className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
        >
          {rawState === 'working' ? 'Preparing…' : 'Download raw storage snapshot'}
        </button>
        {rawState === 'error' && <p className="mt-2 text-sm text-red-600">Could not build the snapshot. Please try again.</p>}
      </div>
    </div>
  )
}
