'use client'

import { useActionState } from 'react'
import { login } from '../../actions/auth'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <form action={formAction} className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-ink">
          Admin <span className="font-display italic text-brand">login</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to edit the site.</p>

        <label className="mt-6 block text-xs font-medium text-neutral-600" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />

        {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
