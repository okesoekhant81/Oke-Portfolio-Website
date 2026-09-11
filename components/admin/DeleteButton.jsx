'use client'

export default function DeleteButton({ confirmText = 'Delete this?' }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault()
      }}
      className="text-sm text-neutral-400 hover:text-red-600"
    >
      Delete
    </button>
  )
}
