'use client'

import { useState } from 'react'
import { inspectPiiTablesAction, testJsonbEncodingAction } from '../../app/actions/dbDiagnostic'

function useDownloadAction(action, filenamePrefix) {
  const [state, setState] = useState('idle') // idle | working | error
  const [errorMsg, setErrorMsg] = useState(null)

  async function run() {
    setState('working')
    setErrorMsg(null)
    try {
      const result = await action()
      if (result.error) {
        setErrorMsg(result.error)
        setState('idle')
        return
      }
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return { state, errorMsg, run }
}

export default function DbDiagnosticButton() {
  const inspect = useDownloadAction(inspectPiiTablesAction, 'db-diagnostic')
  const encodingTest = useDownloadAction(testJsonbEncodingAction, 'db-encoding-test')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500">
          Read-only — downloads the raw content of a few rows from Postgres, exactly as stored, to see what actually
          happened to the missing fields.
        </p>
        <button
          type="button"
          onClick={inspect.run}
          disabled={inspect.state === 'working'}
          className="mt-3 rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
        >
          {inspect.state === 'working' ? 'Inspecting…' : 'Download raw Postgres rows'}
        </button>
        {inspect.state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run this. Please try again.</p>}
        {inspect.errorMsg && <p className="mt-2 text-sm text-red-600">{inspect.errorMsg}</p>}
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <p className="text-sm text-neutral-500">
          Writes a tiny test value into a throwaway table a few different ways, to isolate exactly which write
          pattern causes the double-encoding. Never touches real data.
        </p>
        <button
          type="button"
          onClick={encodingTest.run}
          disabled={encodingTest.state === 'working'}
          className="mt-3 rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
        >
          {encodingTest.state === 'working' ? 'Testing…' : 'Run encoding test'}
        </button>
        {encodingTest.state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run this. Please try again.</p>}
        {encodingTest.errorMsg && <p className="mt-2 text-sm text-red-600">{encodingTest.errorMsg}</p>}
      </div>
    </div>
  )
}
