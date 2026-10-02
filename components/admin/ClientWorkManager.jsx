'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  addClientWorkAction,
  updateClientWorkAction,
  deleteClientWorkAction,
  reorderClientWorkAction,
} from '../../app/actions/clientWork'
import { FormLocaleContext, LockContext, Field, TextArea, LanguageTabs } from './ContentFormFields'
import { useConfirm } from './ConfirmProvider'

const inputClass = 'rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand'

function ReorderButtons({ id, disabled }) {
  const [, startTransition] = useTransition()

  function move(direction) {
    const formData = new FormData()
    formData.set('id', id)
    formData.set('direction', direction)
    startTransition(async () => {
      try {
        await reorderClientWorkAction(formData)
      } catch {
        // Low-stakes, no local state to roll back.
      }
    })
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => move('up')}
        disabled={disabled}
        className="text-neutral-400 hover:text-brand disabled:opacity-30"
        aria-label="Move up"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => move('down')}
        disabled={disabled}
        className="text-neutral-400 hover:text-brand disabled:opacity-30"
        aria-label="Move down"
      >
        ▼
      </button>
    </div>
  )
}

function DeleteButton({ id, name }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(false)
  const [, startTransition] = useTransition()
  const confirm = useConfirm()

  async function handleDelete() {
    if (!(await confirm(`Delete "${name}"? This can't be undone.`))) return
    setDeleting(true)
    setError(false)
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await deleteClientWorkAction(formData)
      } catch {
        setError(true)
      } finally {
        setDeleting(false)
      }
    })
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-60"
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
      {error && <span className="text-xs text-red-600">Couldn&rsquo;t delete</span>}
    </span>
  )
}

function ClientWorkItem({ entry, isFirst }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [, startTransition] = useTransition()

  function handleSave(formData) {
    formData.set('id', entry.id)
    setSaving(true)
    setError(null)
    startTransition(async () => {
      const result = await updateClientWorkAction(formData)
      setSaving(false)
      if (result?.error) setError(result.error)
      else setEditing(false)
    })
  }

  if (!editing) {
    return (
      <li className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3">
        <ReorderButtons id={entry.id} disabled={isFirst} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">
            {entry.name}
            {entry.scope && <span className="font-normal text-neutral-400"> — {entry.scope}</span>}
          </p>
          {entry.description && <p className="mt-1 text-sm text-neutral-600">{entry.description}</p>}
          {entry.highlight && <p className="mt-1 text-xs font-medium text-brand">{entry.highlight}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button type="button" onClick={() => setEditing(true)} className="text-xs text-neutral-400 hover:text-brand">
            Edit
          </button>
          <DeleteButton id={entry.id} name={entry.name} />
        </div>
      </li>
    )
  }

  return (
    <li className="rounded-lg border border-brand/30 bg-brand/5 p-3">
      <form action={handleSave} className="space-y-3">
        <input name="name" required defaultValue={entry.name} placeholder="Client / project name" className={inputClass} />
        <Field label="Scope (e.g. Branding, Digital Marketing)" name="scope" defaultValue={entry.scope} nameMy="scopeMy" defaultValueMy={entry.scopeMy} />
        <TextArea
          label="What was done"
          name="description"
          defaultValue={entry.description}
          nameMy="descriptionMy"
          defaultValueMy={entry.descriptionMy}
          rows={3}
        />
        <Field
          label="Highlight result (optional — e.g. a stat or growth number)"
          name="highlight"
          defaultValue={entry.highlight}
          nameMy="highlightMy"
          defaultValueMy={entry.highlightMy}
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setError(null)
            }}
            disabled={saving}
            className="text-sm text-neutral-500 hover:text-ink"
          >
            Cancel
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </li>
  )
}

export default function ClientWorkManager({ clientWork }) {
  const [state, formAction, pending] = useActionState(addClientWorkAction, null)
  const [formLocale, setFormLocale] = useState('en')

  return (
    <FormLocaleContext.Provider value={formLocale}>
      <LockContext.Provider value={false}>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <p className="font-display text-base font-bold italic text-brand">Client Work</p>
          <p className="mt-1 text-xs text-neutral-500">
            Shown on the homepage as selected client results. Order here is the order they appear in.
          </p>

          <div className="mt-4">
            <LanguageTabs value={formLocale} onChange={setFormLocale} />
          </div>

          {clientWork.length > 0 && (
            <ul className="mt-4 space-y-3">
              {clientWork.map((entry, i) => (
                <ClientWorkItem key={entry.id} entry={entry} isFirst={i === 0} />
              ))}
            </ul>
          )}

          <form
            action={formAction}
            key={state?.savedAt || 0}
            className="mt-4 space-y-3 border-t border-neutral-100 pt-4"
          >
            <input name="name" required placeholder="Client / project name" className={inputClass} />
            <Field label="Scope (e.g. Branding, Digital Marketing)" name="scope" nameMy="scopeMy" />
            <TextArea label="What was done" name="description" nameMy="descriptionMy" rows={3} />
            <Field label="Highlight result (optional — e.g. a stat or growth number)" name="highlight" nameMy="highlightMy" />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
              >
                {pending ? 'Adding…' : 'Add client work'}
              </button>
              {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
            </div>
          </form>
        </div>
      </LockContext.Provider>
    </FormLocaleContext.Provider>
  )
}
