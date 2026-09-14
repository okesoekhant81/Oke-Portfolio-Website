'use client'

export default function PrintRosterButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-brand hover:text-brand"
    >
      Print roster
    </button>
  )
}
