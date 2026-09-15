'use client'

import { useState } from 'react'
import { migratePiiToPostgresAction } from '../../app/actions/dbMigration'

export default function DbMigrationPanel() {
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)
  const [setupError, setSetupError] = useState(null)

  async function handleClick() {
    setState('working')
    setReport(null)
    setSetupError(null)
    try {
      const result = await migratePiiToPostgresAction()
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
  const allMatch = rows.every(([, r]) => r.totalInPostgres === r.foundInBlob)

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Creates the students/inquiries/admin_users tables if needed and copies every record from Blob into Postgres.
        Nothing is deleted or switched over — the site keeps reading/writing Blob exactly as before either way. Safe
        to run more than once.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-3 rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Migrating…' : 'Copy students/inquiries/admins to Postgres'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run the migration. Please try again.</p>}
      {setupError && <p className="mt-2 text-sm text-red-600">{setupError}</p>}

      {report && (
        <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Table</th>
                <th className="px-3 py-2">Found in Blob</th>
                <th className="px-3 py-2">Inserted this run</th>
                <th className="px-3 py-2">Total in Postgres</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([table, r]) => (
                <tr key={table} className="border-t border-neutral-100">
                  <td className="px-3 py-2 font-mono text-xs">{table}</td>
                  <td className="px-3 py-2">{r.foundInBlob}</td>
                  <td className="px-3 py-2">{r.insertedThisRun}</td>
                  <td className={`px-3 py-2 ${r.totalInPostgres === r.foundInBlob ? 'text-green-700' : 'text-red-600'}`}>
                    {r.totalInPostgres}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={`px-3 py-2 text-xs ${allMatch ? 'text-green-700' : 'text-red-600'}`}>
            {allMatch
              ? 'Postgres matches Blob for every table. Share this with Claude to move on to the next step.'
              : "Totals don't match — share this with Claude before going further."}
          </p>
        </div>
      )}
    </div>
  )
}
