'use client'

import { useState } from 'react'
import { getFullBackupAction } from '../../app/actions/backup'

export default function BackupButton() {
  const [state, setState] = useState('idle') // idle | working | error

  async function handleClick() {
    setState('working')
    try {
      const data = await getFullBackupAction()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
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
        className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Preparing…' : 'Download full backup'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not build the backup. Please try again.</p>}
    </div>
  )
}
