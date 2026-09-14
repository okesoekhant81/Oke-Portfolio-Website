'use client'

import { useActionState } from 'react'
import { addStudentAction } from '../../app/actions/students'

const inputClass = 'rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand'

export default function AddStudentToClassForm({ classDate }) {
  const [state, formAction, pending] = useActionState(addStudentAction, null)

  return (
    <form
      action={formAction}
      key={state?.savedAt || 0}
      className="mt-8 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <p className="text-xs font-semibold text-neutral-500">Add a student to this class</p>
      <input type="hidden" name="classDate" value={classDate} />
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="email" type="email" placeholder="Email" className={inputClass} />
        <input name="phone" placeholder="Phone" className={inputClass} />
        <input name="business" placeholder="Business (optional)" className={inputClass} />
        <input name="role" placeholder="Role (optional)" className={inputClass} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add student'}
        </button>
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  )
}
