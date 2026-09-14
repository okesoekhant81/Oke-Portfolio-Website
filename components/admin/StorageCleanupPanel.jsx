'use client'

import { useState } from 'react'
import { cleanupPlainPathsAction } from '../../app/actions/storageCleanup'

const CONFIRM_TEXT =
  'This permanently deletes the old, unsecured copies of every data file. ' +
  'Only do this after confirming login, edit/delete, and a test registration all work correctly. Continue?'

export default function StorageCleanupPanel() {
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)

  async function handleClick() {
    if (!confirm(CONFIRM_TEXT)) return
    setState('working')
    setReport(null)
    try {
      const result = await cleanupPlainPathsAction()
      setReport(result.report)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  const hasErrors = report?.some((r) => r.status === 'error')

  return (
    <div>
      <p className="text-sm text-red-600">
        Irreversible. Only run this once you&apos;ve verified everything works on the secured paths.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-3 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Deleting…' : 'Delete old unsecured copies'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run the cleanup. Please try again.</p>}

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
                  <td className={`px-3 py-2 ${row.status === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                    {row.status === 'error' ? `Error: ${row.error}` : 'Deleted'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={`px-3 py-2 text-xs ${hasErrors ? 'text-red-600' : 'text-green-700'}`}>
            {hasErrors
              ? 'Some deletes failed — share this with Claude.'
              : 'Old copies removed. The exposure is closed — share this with Claude to finish up.'}
          </p>
        </div>
      )}
    </div>
  )
}
