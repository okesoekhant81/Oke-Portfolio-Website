'use client'

import { useState } from 'react'
import { inspectPiiTablesAction } from '../../app/actions/dbDiagnostic'

export default function DbDiagnosticButton() {
  const [state, setState] = useState('idle') // idle | working | error
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleClick() {
    setState('working')
    setErrorMsg(null)
    try {
      const result = await inspectPiiTablesAction()
      if (result.error) {
        setErrorMsg(result.error)
        setState('idle')
        return
      }
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `db-diagnostic-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Read-only — downloads the raw content of a few rows from Postgres, exactly as stored, to see what actually
        happened to the missing fields.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-3 rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Inspecting…' : 'Download raw Postgres rows'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run this. Please try again.</p>}
      {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
    </div>
  )
}
