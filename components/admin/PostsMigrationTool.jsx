'use client'

import { useState } from 'react'
import { cleanupOldPostFilesAction } from '../../app/actions/postsMigration'
import { useConfirm } from './ConfirmProvider'

// Temporary, one-time tool for the posts single-file migration (see
// lib/content/posts.js) — the migration copy and code cutover have already
// shipped and been verified in production; this is the final cleanup step,
// deleting the old index and per-post files the site no longer reads or
// writes. Remove this component (and its section on /admin/backup) once
// this has been run; it has no purpose after that.
export default function PostsMigrationTool() {
  const [state, setState] = useState('idle') // idle | working | error
  const [result, setResult] = useState(null)
  const confirm = useConfirm()

  async function handleClick() {
    const ok = await confirm('Permanently delete the old per-post storage files? This can\'t be undone.', {
      confirmLabel: 'Delete',
    })
    if (!ok) return

    setState('working')
    try {
      setResult(await cleanupOldPostFilesAction())
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
        className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === 'working' ? 'Deleting…' : 'Delete old per-post files'}
      </button>
      {state === 'error' && <p className="mt-2 text-sm text-red-600">Could not clean up. Please try again.</p>}

      {result && (
        <p className="mt-2 text-sm text-green-700">
          Deleted {result.deletedCount} old post files and the index. Let Claude know so this tool can be removed.
        </p>
      )}
    </div>
  )
}
