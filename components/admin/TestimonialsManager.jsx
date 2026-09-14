'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  addTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialAction,
} from '../../app/actions/testimonials'
import ImageField from './ImageField'
import StarRating from '../StarRating'
import { FormLocaleContext, LockContext, Field, TextArea, LanguageTabs } from './ContentFormFields'

const inputClass = 'rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand'

function RatingField({ name, defaultValue = 5 }) {
  const [value, setValue] = useState(defaultValue)
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">Rating</label>
      <div className="mt-1">
        <StarRating value={value} onChange={setValue} size={20} />
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

function ReorderButtons({ id, disabled }) {
  const [, startTransition] = useTransition()

  function move(direction) {
    const formData = new FormData()
    formData.set('id', id)
    formData.set('direction', direction)
    startTransition(async () => {
      try {
        await reorderTestimonialAction(formData)
      } catch {
        // Low-stakes, no local state to roll back — a failed reorder just
        // means the list doesn't change; the buttons stay usable to retry.
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

  function handleDelete() {
    if (!confirm(`Delete the testimonial from "${name}"?`)) return
    setDeleting(true)
    setError(false)
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await deleteTestimonialAction(formData)
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

function TestimonialItem({ testimonial, isFirst }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [, startTransition] = useTransition()

  function handleSave(formData) {
    formData.set('id', testimonial.id)
    setSaving(true)
    setError(null)
    startTransition(async () => {
      const result = await updateTestimonialAction(formData)
      setSaving(false)
      if (result?.error) setError(result.error)
      else setEditing(false)
    })
  }

  if (!editing) {
    return (
      <li className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3">
        <ReorderButtons id={testimonial.id} disabled={isFirst} />
        <div className="min-w-0 flex-1">
          <StarRating value={testimonial.rating ?? 5} size={14} />
          <p className="mt-1 text-sm font-semibold text-ink">
            {testimonial.name}
            {testimonial.role && <span className="font-normal text-neutral-400"> — {testimonial.role}</span>}
          </p>
          <p className="mt-1 text-sm text-neutral-600">&ldquo;{testimonial.quote}&rdquo;</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button type="button" onClick={() => setEditing(true)} className="text-xs text-neutral-400 hover:text-brand">
            Edit
          </button>
          <DeleteButton id={testimonial.id} name={testimonial.name} />
        </div>
      </li>
    )
  }

  return (
    <li className="rounded-lg border border-brand/30 bg-brand/5 p-3">
      <form action={handleSave} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="name" required defaultValue={testimonial.name} placeholder="Name" className={inputClass} />
          <Field
            label="Role / business (optional)"
            name="role"
            defaultValue={testimonial.role}
            nameMy="roleMy"
            defaultValueMy={testimonial.roleMy}
          />
        </div>
        <TextArea
          label="Quote"
          name="quote"
          defaultValue={testimonial.quote}
          nameMy="quoteMy"
          defaultValueMy={testimonial.quoteMy}
          rows={3}
        />
        <RatingField name="rating" defaultValue={testimonial.rating ?? 5} />
        <ImageField label="Photo (optional)" name="photo" defaultValue={testimonial.photo} />
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

export default function TestimonialsManager({ testimonials }) {
  const [state, formAction, pending] = useActionState(addTestimonialAction, null)
  const [formLocale, setFormLocale] = useState('en')

  return (
    <FormLocaleContext.Provider value={formLocale}>
      <LockContext.Provider value={false}>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <p className="font-display text-base font-bold italic text-brand">Testimonials</p>
          <p className="mt-1 text-xs text-neutral-500">
            Shown on the homepage and workshop page as social proof. Order here is the order they appear in.
          </p>

          <div className="mt-4">
            <LanguageTabs value={formLocale} onChange={setFormLocale} />
          </div>

          {testimonials.length > 0 && (
            <ul className="mt-4 space-y-3">
              {testimonials.map((t, i) => (
                <TestimonialItem key={t.id} testimonial={t} isFirst={i === 0} />
              ))}
            </ul>
          )}

          <form
            action={formAction}
            key={state?.savedAt || 0}
            className="mt-4 space-y-3 border-t border-neutral-100 pt-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Name" className={inputClass} />
              <Field label="Role / business (optional)" name="role" nameMy="roleMy" />
            </div>
            <TextArea label="Quote" name="quote" nameMy="quoteMy" rows={3} />
            <RatingField name="rating" defaultValue={5} />
            <ImageField label="Photo (optional)" name="photo" defaultValue="" />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
              >
                {pending ? 'Adding…' : 'Add testimonial'}
              </button>
              {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
            </div>
          </form>
        </div>
      </LockContext.Provider>
    </FormLocaleContext.Provider>
  )
}
