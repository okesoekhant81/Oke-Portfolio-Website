'use client'

import { createContext, useContext } from 'react'

// Which bilingual tab (English/Myanmar) is showing, and whether the form is
// locked (view mode) or unlocked (edit mode) — both read by Field/TextArea
// below without every call site having to thread them through as props.
export const FormLocaleContext = createContext('en')
export const LockContext = createContext(false)

// Collapsed by default — the same zero-JS <details>/<summary> disclosure
// already used for AdminNav's dropdowns and the public site's
// WorkshopOutline/FAQAccordion, applied here so a content form with many
// sections (Workshop's is now 8) opens as a scannable list of headings
// instead of one long always-expanded scroll. A closed section's inputs
// stay mounted and still submit with the form — same as a hidden bilingual
// field in Field/TextArea below — so nothing is lost by collapsing it.
export function Section({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="group mt-4 min-w-0 rounded-xl border border-neutral-200 bg-white p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-bold italic text-brand [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  )
}

const fieldBase = 'mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-200'
const fieldEditable = 'border-neutral-300 bg-white focus:border-brand'
// Locked fields stay in the DOM (readOnly, not disabled) so their value
// still submits with the form — only visually and interactively inert.
const fieldLocked = 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-default'

// When `nameMy` is given, both language inputs stay mounted (so switching
// tabs never loses what you typed) and only the active one is shown —
// hidden inputs still submit with the form, so one Save writes both.
export function Field({ label, name, defaultValue, nameMy, defaultValueMy }) {
  const formLocale = useContext(FormLocaleContext)
  const locked = useContext(LockContext)
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        readOnly={locked}
        tabIndex={locked ? -1 : 0}
        className={`${fieldBase} ${locked ? fieldLocked : fieldEditable} ${nameMy && formLocale !== 'en' ? 'hidden' : ''}`}
      />
      {nameMy && (
        <input
          name={nameMy}
          defaultValue={defaultValueMy}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          placeholder="မြန်မာလို ရေးပါ…"
          className={`${fieldBase} ${locked ? fieldLocked : fieldEditable} ${formLocale !== 'my' ? 'hidden' : ''}`}
        />
      )}
    </div>
  )
}

export function TextArea({ label, name, defaultValue, nameMy, defaultValueMy, rows = 4 }) {
  const formLocale = useContext(FormLocaleContext)
  const locked = useContext(LockContext)
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        readOnly={locked}
        tabIndex={locked ? -1 : 0}
        className={`${fieldBase} ${locked ? fieldLocked : fieldEditable} ${nameMy && formLocale !== 'en' ? 'hidden' : ''}`}
      />
      {nameMy && (
        <textarea
          name={nameMy}
          defaultValue={defaultValueMy}
          rows={rows}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          placeholder="မြန်မာလို ရေးပါ…"
          className={`${fieldBase} ${locked ? fieldLocked : fieldEditable} ${formLocale !== 'my' ? 'hidden' : ''}`}
        />
      )}
    </div>
  )
}

export function LanguageTabs({ value, onChange }) {
  return (
    <div className="sticky top-0 z-10 -mx-6 flex gap-2 border-b border-neutral-200 bg-neutral-50 px-6 py-3 sm:-mx-0 sm:px-0">
      {[
        { key: 'en', label: 'English' },
        { key: 'my', label: 'မြန်မာ' },
      ].map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === tab.key ? 'bg-brand text-white' : 'bg-white text-neutral-600 hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
      <p className="ml-auto self-center text-xs text-neutral-400">
        {value === 'en' ? 'Editing English' : 'Editing Myanmar — blank fields fall back to English on the site'}
      </p>
    </div>
  )
}
