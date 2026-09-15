'use client'

import { useState } from 'react'
import { remigratePiiToPostgresAction } from '../../app/actions/dbMigration'

export default function DbRemigrationPanel() {
  const [state, setState] = useState('idle') // idle | working | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleClick() {
    if (!confirm('This wipes the current (broken) Postgres students/inquiries/admin_users data and re-copies fresh from Blob. Continue?')) return
    setState('working')
    setErrorMsg(null)
    setResult(null)
    try {
      const res = await remigratePiiToPostgresAction()
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setResult(res)
      }
      setState('idle')
    } catch {
      setState('error')
    }
  }

  const rows = result ? Object.entries(result.report) : []
  const allMatch = rows.every(([, r]) => r.totalInPostgres === r.foundInBlob)
  const sampleOk =
    result &&
    result.verification.studentSample?.type === 'object' &&
    result.verification.studentSample?.name &&
    result.verification.inquirySample?.type === 'object' &&
    result.verification.inquirySample?.name

  return (
    <div>
      <p className="text-sm text-red-600">
        Wipes and re-copies the PII tables with the encoding fix applied. Blob (the source) is untouched either way.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-3 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Re-migrating…' : 'Wipe and re-migrate with the fix'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run this. Please try again.</p>}
      {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Table</th>
                  <th className="px-3 py-2">Found in Blob</th>
                  <th className="px-3 py-2">Total in Postgres</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([table, r]) => (
                  <tr key={table} className="border-t border-neutral-100">
                    <td className="px-3 py-2 font-mono text-xs">{table}</td>
                    <td className="px-3 py-2">{r.foundInBlob}</td>
                    <td className={`px-3 py-2 ${r.totalInPostgres === r.foundInBlob ? 'text-green-700' : 'text-red-600'}`}>
                      {r.totalInPostgres}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-neutral-200 p-3 text-xs">
            <p className="font-medium text-ink">Content verification (not just counts this time)</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result.verification, null, 2)}</pre>
          </div>

          <p className={`text-xs ${allMatch && sampleOk ? 'text-green-700' : 'text-red-600'}`}>
            {allMatch && sampleOk
              ? 'Counts match and sample records show type "object" with real name/email/phone. Share this with Claude to move on.'
              : 'Something still looks wrong — share this with Claude before going further.'}
          </p>
        </div>
      )}
    </div>
  )
}
