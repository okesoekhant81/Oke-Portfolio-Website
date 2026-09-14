'use client'

import { useActionState } from 'react'
import { submitInquiryAction } from '../app/actions/inquiries'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors duration-300 focus:border-brand dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100'
const labelClass = 'block text-xs font-medium text-muted dark:text-neutral-400'

export default function RegistrationForm({ locale = 'en' }) {
  const dict = getDictionary(locale)
  const [state, formAction, pending] = useActionState(submitInquiryAction, null)

  if (state?.success) {
    return (
      <div className="rounded-xl border border-brand/30 bg-brand/5 p-6 text-center dark:bg-brand/10">
        <p className={`font-display text-lg font-bold text-brand ${italicIfLatin(locale)}`}>
          {dict.workshop.formSuccessTitle}
        </p>
        <p className="mt-2 text-sm text-muted dark:text-neutral-400">{dict.workshop.formSuccessBody}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            {dict.workshop.formName}
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            {dict.workshop.formEmail}
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="phone">
            {dict.workshop.formPhone}
          </label>
          <input id="phone" name="phone" type="tel" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="business">
            {dict.workshop.formBusiness}
          </label>
          <input id="business" name="business" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="role">
            {dict.workshop.formRole}
          </label>
          <input id="role" name="role" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="participants">
            {dict.workshop.formParticipants}
          </label>
          <select id="participants" name="participants" defaultValue="1" className={inputClass}>
            <option value="1">{dict.workshop.formParticipants1}</option>
            <option value="2">{dict.workshop.formParticipants2}</option>
            <option value="3-5">{dict.workshop.formParticipants3to5}</option>
            <option value="5+">{dict.workshop.formParticipants5plus}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="message">
          {dict.workshop.formMessage}
        </label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-opacity duration-300 hover:opacity-90 disabled:opacity-60"
      >
        {pending ? dict.workshop.formSubmitting : dict.workshop.formSubmit}
      </button>
    </form>
  )
}
