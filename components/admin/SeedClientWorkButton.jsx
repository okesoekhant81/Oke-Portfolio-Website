'use client'

import { useState } from 'react'
import { seedClientWorkAction } from '../../app/actions/clientWork'

// Temporary, one-time tool — imports the first batch of case studies typed
// up from the client's own notes (see SEED_ENTRIES in
// app/actions/clientWork.js). Remove this component and its spot on
// /admin/client-work once it's been run.
export default function SeedClientWorkButton() {
  const [state, setState] = useState('idle') // idle | working | error
  const [result, setResult] = useState(null)

  async function handleClick() {
    setState('working')
    try {
      setResult(await seedClientWorkAction())
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-brand/30 bg-brand/5 p-4">
      <p className="text-sm font-semibold text-ink">One-time: import first case studies</p>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        className="mt-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Importing…' : 'Import 7 case studies'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not import. Please try again.</p>}
      {result && (
        <p className="mt-2 text-sm text-green-700">
          Added {result.addedCount}, skipped {result.skippedCount} already present.
        </p>
      )}
    </div>
  )
}
