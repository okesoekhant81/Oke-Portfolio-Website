'use client'

import { useConfirm } from './ConfirmProvider'

// Always used inside a <form action={someDeleteAction}> — preventDefault()
// runs unconditionally so the native submit never fires until the dialog
// actually resolves, then requestSubmit() re-triggers the exact same
// submission (Server Action included) a real click would have.
export default function DeleteButton({ confirmText = 'Delete this?' }) {
  const confirm = useConfirm()

  async function handleClick(e) {
    e.preventDefault()
    if (await confirm(confirmText)) {
      e.currentTarget.form.requestSubmit()
    }
  }

  return (
    <button type="submit" onClick={handleClick} className="text-sm text-neutral-400 hover:text-red-600">
      Delete
    </button>
  )
}
