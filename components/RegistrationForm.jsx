'use client'

import { useActionState, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { submitInquiryAction } from '../app/actions/inquiries'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

const EASE = [0.16, 1, 0.3, 1]
const TOTAL_STEPS = 4

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors duration-300 focus:border-brand dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100'
const labelClass = 'block text-xs font-medium text-muted dark:text-neutral-400'

// Required fields (name, email, phone) each get their own step — short
// enough to stay well under the ~4-step point where research shows
// abandonment climbs, while still giving the "one thing at a time" feel
// that's easiest on mobile. The four optional fields are bundled into a
// single last step instead of one each, since splitting fields nobody's
// required to fill only adds taps without adding clarity.
export default function RegistrationForm({ locale = 'en' }) {
  const dict = getDictionary(locale)
  const [state, dispatch, pending] = useActionState(submitInquiryAction, null)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    role: '',
    participants: '1',
    message: '',
  })
  const activeInputRef = useRef(null)

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  function goNext() {
    if (activeInputRef.current && !activeInputRef.current.reportValidity()) return
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleEnter(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    goNext()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.set(key, value))
    dispatch(formData)
  }

  if (state?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="rounded-xl border border-brand/30 bg-brand/5 p-6 text-center dark:bg-brand/10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.35, ease: EASE }}
            />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3, ease: EASE }}
          className={`mt-4 font-display text-lg font-bold text-brand ${italicIfLatin(locale)}`}
        >
          {dict.workshop.formSuccessTitle}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.38, ease: EASE }}
          className="mt-2 text-sm text-muted dark:text-neutral-400"
        >
          {dict.workshop.formSuccessBody}
        </motion.p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <p className="text-xs text-muted dark:text-neutral-400">
          {dict.workshop.formStep} {step + 1} / {TOTAL_STEPS}
        </p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-brand"
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.45, ease: EASE }}
          />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {step === 0 && (
              <div>
                <label className={labelClass} htmlFor="name">
                  {dict.workshop.formName}
                </label>
                <input
                  ref={activeInputRef}
                  id="name"
                  required
                  autoFocus
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => update('name', e.target.value)}
                  onKeyDown={handleEnter}
                  className={inputClass}
                />
              </div>
            )}

            {step === 1 && (
              <div>
                <label className={labelClass} htmlFor="email">
                  {dict.workshop.formEmail}
                </label>
                <input
                  ref={activeInputRef}
                  id="email"
                  type="email"
                  inputMode="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => update('email', e.target.value)}
                  onKeyDown={handleEnter}
                  className={inputClass}
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <label className={labelClass} htmlFor="phone">
                  {dict.workshop.formPhone}
                </label>
                <input
                  ref={activeInputRef}
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoFocus
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  onKeyDown={handleEnter}
                  className={inputClass}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-muted dark:text-neutral-400">{dict.workshop.formOptionalHint}</p>
                <div>
                  <label className={labelClass} htmlFor="business">
                    {dict.workshop.formBusiness}
                  </label>
                  <input
                    id="business"
                    autoFocus
                    value={values.business}
                    onChange={(e) => update('business', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="role">
                    {dict.workshop.formRole}
                  </label>
                  <input
                    id="role"
                    value={values.role}
                    onChange={(e) => update('role', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="participants">
                    {dict.workshop.formParticipants}
                  </label>
                  <select
                    id="participants"
                    value={values.participants}
                    onChange={(e) => update('participants', e.target.value)}
                    className={inputClass}
                  >
                    <option value="1">{dict.workshop.formParticipants1}</option>
                    <option value="2">{dict.workshop.formParticipants2}</option>
                    <option value="3-5">{dict.workshop.formParticipants3to5}</option>
                    <option value="5+">{dict.workshop.formParticipants5plus}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="message">
                    {dict.workshop.formMessage}
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={values.message}
                    onChange={(e) => update('message', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {state?.error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <motion.button
            type="button"
            onClick={goBack}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm text-ink transition-colors duration-300 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-100"
          >
            {dict.workshop.formBack}
          </motion.button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <motion.button
            type="button"
            onClick={goNext}
            whileHover={{ scale: 1.04, boxShadow: '0 10px 25px -8px rgba(232,54,6,0.55)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white"
          >
            {dict.workshop.formNext}
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            disabled={pending}
            whileHover={pending ? {} : { scale: 1.04, boxShadow: '0 10px 25px -8px rgba(232,54,6,0.55)' }}
            whileTap={pending ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? dict.workshop.formSubmitting : dict.workshop.formSubmit}
          </motion.button>
        )}
      </div>
    </form>
  )
}
