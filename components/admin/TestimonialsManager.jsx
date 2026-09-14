'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  addTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialAction,
} from '../../app/actions/testimonials'
import ImageField from './ImageField'
import { FormLocaleContext, LockContext } from './ContentFormFields'

const inputClass = 'rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand'

function ReorderButtons({ id, disabled }) {
  const [, startTransition] = useTransition()

  function move(direction) {
    const formData = new FormData()
    formData.set('id', id)
    formData.set('direction', direction)
    startTransition(() => reorderTestimonialAction(formData))
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
  const [, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete the testimonial from "${name}"?`)) return
    setDeleting(true)
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      await deleteTestimonialAction(formData)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-60"
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  )
}

// Reused stand-alone rather than through <Section>/<Field> — this form
// isn't bilingual (a testimonial is a direct quote, translating it would
// misrepresent what the person said), so it only needs ImageField's
// context providers, not the rest of ContentFormFields' machinery.
export default function TestimonialsManager({ testimonials }) {
  const [state, formAction, pending] = useActionState(addTestimonialAction, null)

  return (
    <FormLocaleContext.Provider value="en">
      <LockContext.Provider value={false}>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <p className="font-display text-base font-bold italic text-brand">Testimonials</p>
          <p className="mt-1 text-xs text-neutral-500">
            Shown on the homepage and workshop page as social proof. Order here is the order they appear in.
          </p>

          {testimonials.length > 0 && (
            <ul className="mt-4 space-y-3">
              {testimonials.map((t, i) => (
                <li key={t.id} className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3">
                  <ReorderButtons id={t.id} disabled={i === 0} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {t.name}
                      {t.role && <span className="font-normal text-neutral-400"> — {t.role}</span>}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <DeleteButton id={t.id} name={t.name} />
                </li>
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
              <input name="role" placeholder="Role / business (optional)" className={inputClass} />
            </div>
            <textarea name="quote" required rows={3} placeholder="Quote" className={`w-full ${inputClass}`} />
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
