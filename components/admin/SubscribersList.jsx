'use client'

import { useState, useTransition } from 'react'
import { deleteSubscriberAction } from '../../app/actions/newsletter'
import { useSearchFilter, SearchBar } from './SearchFilterBar'
import { toCsv, downloadCsv } from '../../lib/csv'
import { useConfirm } from './ConfirmProvider'

function exportSubscribers(subscribers) {
  const csv = toCsv(subscribers, [
    { label: 'Email', value: (s) => s.email },
    { label: 'Subscribed at', value: (s) => s.subscribedAt },
  ])
  downloadCsv(`subscribers-${new Date().toISOString().slice(0, 10)}.csv`, csv)
}

function DeleteButton({ email }) {
  const [deleting, setDeleting] = useState(false)
  const [, startTransition] = useTransition()
  const confirm = useConfirm()

  async function handleDelete() {
    if (!(await confirm(`Remove "${email}" from the list?`))) return
    setDeleting(true)
    const formData = new FormData()
    formData.set('email', email)
    startTransition(async () => {
      await deleteSubscriberAction(formData)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-60"
    >
      {deleting ? 'Removing…' : 'Remove'}
    </button>
  )
}

export default function SubscribersList({ subscribers }) {
  const { query, setQuery, filtered } = useSearchFilter(subscribers, { searchKeys: ['email'] })

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search email…" />
        <button
          type="button"
          onClick={() => exportSubscribers(filtered)}
          className="ml-auto rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-brand hover:text-brand"
        >
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No subscribers match your search.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-100">
            {filtered.map((s) => (
              <li key={s.email} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{s.email}</p>
                  <p className="text-xs text-neutral-400">{new Date(s.subscribedAt).toLocaleDateString()}</p>
                </div>
                <DeleteButton email={s.email} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
