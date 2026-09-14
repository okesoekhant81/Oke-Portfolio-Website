'use client'

import { useState } from 'react'
import { migrateStorageToSecuredPathsAction } from '../../app/actions/storageMigration'

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
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)
  const [setupError, setSetupError] = useState(null)

  async function handleClick() {
    setState('working')
    setReport(null)
    setSetupError(null)
    try {
      const result = await migrateStorageToSecuredPathsAction()
      if (result.error) {
        setSetupError(result.error)
      } else {
        setReport(result.report)
      }
      setState('idle')
    } catch {
      setState('error')
    }
  }

  const hasProblems = report?.some((r) => r.status === 'mismatch' || r.status === 'error')

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Copies every data file to an unguessable location, alongside the current one — nothing is deleted or
        switched over yet, so the site keeps working exactly as before either way. Safe to run more than once.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-3 rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Copying…' : 'Copy data to a secured location'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run the copy. Please try again.</p>}
      {setupError && <p className="mt-2 text-sm text-red-600">{setupError}</p>}

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
  )
}
