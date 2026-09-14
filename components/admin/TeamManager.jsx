'use client'

import { useActionState, useState, useTransition } from 'react'
import { addAdminUserAction, deleteAdminUserAction } from '../../app/actions/adminUsers'

function DeleteButton({ id, name }) {
  const [deleting, setDeleting] = useState(false)
  const [, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Remove ${name}'s admin access? They'll no longer be able to sign in.`)) return
    setDeleting(true)
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      await deleteAdminUserAction(formData)
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

// The owner (ADMIN_PASSWORD) isn't in this list — it's not a stored
// account, just the master password checked directly in app/actions/auth.js
// — so there's always at least one way in even with zero team members added.
export default function TeamManager({ users }) {
  const [state, formAction, pending] = useActionState(addAdminUserAction, null)

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6">
      <p className="font-display text-base font-bold italic text-brand">Team</p>
      <p className="mt-1 text-xs text-neutral-500">
        Named admin accounts, separate from the master password — each signs in with their own email and password.
      </p>

      {users.length > 0 && (
        <ul className="mt-4 space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                <p className="truncate text-xs text-neutral-400">{u.email}</p>
              </div>
              <DeleteButton id={u.id} name={u.name} />
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} key={state?.savedAt || 0} className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600">Name</label>
          <input
            name="name"
            required
            className="mt-1 w-40 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-48 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-40 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add admin'}
        </button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  )
}
