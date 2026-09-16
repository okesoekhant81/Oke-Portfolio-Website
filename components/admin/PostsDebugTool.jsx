'use client'

import { useState } from 'react'
import { debugPostsAction } from '../../app/actions/postsDebug'

// Temporary diagnostic tool — see app/actions/postsDebug.js. Remove once
// the "new article shows image but no title/body on the public page" bug
// is found and fixed.
export default function PostsDebugTool() {
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)

  async function handleClick() {
    setState('working')
    try {
      setReport(await debugPostsAction())
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
        {state === 'working' ? 'Checking…' : 'Run posts debug check'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run the check. Please try again.</p>}

      {report && (
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-neutral-900 p-4 text-xs text-neutral-100">
          {JSON.stringify(report, null, 2)}
        </pre>
      )}
    </div>
  )
}
