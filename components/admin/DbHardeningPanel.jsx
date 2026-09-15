'use client'

import { useState } from 'react'
import { hardenPiiTablesAction } from '../../app/actions/dbHardening'

export default function DbHardeningPanel() {
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)
  const [setupError, setSetupError] = useState(null)

  async function handleClick() {
    setState('working')
    setReport(null)
    setSetupError(null)
    try {
      const result = await hardenPiiTablesAction()
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

  const rows = report ? Object.entries(report) : []
  const allEnabled = rows.every(([, enabled]) => enabled)

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Enables Row Level Security on the students/inquiries/admin_users tables — without it, Supabase&apos;s
        auto-generated REST API can serve them to anyone holding the project&apos;s public key, bypassing this
        app&apos;s login entirely. Doesn&apos;t change how the app itself reads or writes. Safe to run more than
        once.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-3 rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Applying…' : 'Enable Row Level Security'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not apply this. Please try again.</p>}
      {setupError && <p className="mt-2 text-sm text-red-600">{setupError}</p>}

      {report && (
        <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Table</th>
                <th className="px-3 py-2">Row Level Security</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([table, enabled]) => (
                <tr key={table} className="border-t border-neutral-100">
                  <td className="px-3 py-2 font-mono text-xs">{table}</td>
                  <td className={`px-3 py-2 ${enabled ? 'text-green-700' : 'text-red-600'}`}>
                    {enabled ? 'Enabled' : 'Not enabled'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={`px-3 py-2 text-xs ${allEnabled ? 'text-green-700' : 'text-red-600'}`}>
            {allEnabled
              ? 'All three tables are locked down. Share this with Claude to finish up.'
              : 'Something is still off — share this with Claude.'}
          </p>
        </div>
      )}
    </div>
  )
}
