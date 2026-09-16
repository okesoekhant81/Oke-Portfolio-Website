'use client'

import { useState } from 'react'
import { migratePostsToSplitStorageAction } from '../../app/actions/postsSplitMigration'

// Temporary, one-time tool — copies posts-all.json into the new split
// storage shape (a lightweight list file + one full-content file per post)
// so it can be verified before the code is cut over to read/write it. See
// app/actions/postsSplitMigration.js for why. Remove this component once
// that cutover has shipped and been confirmed in production.
export default function PostsSplitMigrationTool() {
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)

  async function handleClick() {
    setState('working')
    try {
      setReport(await migratePostsToSplitStorageAction())
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
        className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Copying…' : 'Run posts split migration copy'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run the migration. Please try again.</p>}

      {report && (
        <p className="mt-3 text-sm text-green-700">Copied {report.migratedCount} posts into the split storage shape.</p>
      )}
    </div>
  )
}
