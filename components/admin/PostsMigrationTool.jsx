'use client'

import { useState } from 'react'
import { migratePostsToSingleFileAction } from '../../app/actions/postsMigration'

// Temporary, one-time tool — copies every post into the new single-file
// storage shape (content/posts-all.json) so it can be verified before the
// code is cut over to read/write it. Remove this component (and the button
// below) once that cutover has shipped and been confirmed in production;
// it has no purpose after that.
export default function PostsMigrationTool() {
  const [state, setState] = useState('idle') // idle | working | error
  const [report, setReport] = useState(null)

  async function handleClick() {
    setState('working')
    try {
      setReport(await migratePostsToSingleFileAction())
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
        {state === 'working' ? 'Copying…' : 'Run posts migration copy'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not run the migration. Please try again.</p>}

      {report && (
        <div className="mt-3 text-sm text-neutral-700">
          <p>
            Indexed slugs: {report.indexedSlugCount} — copied: <span className="font-medium text-ink">{report.migratedCount}</span>
          </p>
          {report.missingSlugs.length > 0 && (
            <p className="mt-1 text-red-600">
              Index referenced {report.missingSlugs.length} slug(s) with no post file: {report.missingSlugs.join(', ')}
            </p>
          )}
          {report.missingSlugs.length === 0 && report.migratedCount === report.indexedSlugCount && (
            <p className="mt-1 text-green-700">All indexed posts copied cleanly. Safe to proceed with cutover.</p>
          )}
        </div>
      )}
    </div>
  )
}
