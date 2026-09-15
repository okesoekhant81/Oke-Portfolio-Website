'use client'

import { useState } from 'react'
import { migrateNewsletterToPostgresAction } from '../../app/actions/dbMigration'

export default function NewsletterMigrationPanel() {
  const [state, setState] = useState('idle') // idle | working | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleClick() {
    setState('working')
    setErrorMsg(null)
    setResult(null)
    try {
      const res = await migrateNewsletterToPostgresAction()
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

  const ok = result && result.totalInPostgres === result.foundInBlob && result.sample?.type === 'object'

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Copies newsletter subscriber emails from Blob to Postgres (RLS enabled). Blob is untouched. Safe to re-run.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-3 rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Migrating…' : 'Copy subscribers to Postgres'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run this. Please try again.</p>}
      {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}

      {result && (
        <div className="mt-3 rounded-lg border border-neutral-200 p-3 text-xs">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          <p className={`mt-2 ${ok ? 'text-green-700' : 'text-red-600'}`}>
            {ok ? 'Counts match and the sample is a real object. Share this with Claude.' : 'Something looks off — share this with Claude.'}
          </p>
        </div>
      )}
    </div>
  )
}
