'use client'

import { useActionState, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { submitInquiryAction } from '../app/actions/inquiries'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

const EASE = [0.16, 1, 0.3, 1]

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors duration-300 focus:border-brand dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100'
const labelClass = 'block text-xs font-medium text-muted dark:text-neutral-400'

function formatClassDate(dateStr, dateLocale) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
}

// A copy button next to the raw number is easier for a registrant than a
// QR code they'd have to screenshot-and-crop or scan with a second device
// — this is what actually gets pasted into their banking/wallet app, QR or
// not, so it's shown regardless of whether a QR image was also uploaded.
function CopyRow({ label, value, copyLabel, copiedLabel }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null

  function handleCopy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="min-w-0 truncate text-muted dark:text-neutral-400">
        {label}: <span className="font-medium text-ink dark:text-neutral-100">{value}</span>
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-ink transition-colors duration-300 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-100"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  )
}

// Required fields (name, email, phone) each get their own step — short
// enough to stay well under the ~4-step point where research shows
// abandonment climbs, while still giving the "one thing at a time" feel
// that's easiest on mobile. The optional fields are bundled into a single
// last step instead of one each, since splitting fields nobody's required
// to fill only adds taps without adding clarity. The date-picker step only
// exists when the admin has actually added upcoming class dates — with
// none configured, the form just skips straight to Name, same shape as
// before this existed.
export default function RegistrationForm({ locale = 'en', classDates = [], paymentMethods = [] }) {
  const dict = getDictionary(locale)
  const [state, dispatch, pending] = useActionState(submitInquiryAction, null)
  // Payment lives inside the 'optional' step below rather than as its own
  // step — capped at 5 steps total this way regardless of how many payment
  // methods (or future optional bits) get added, instead of the step count
  // creeping up every time a new optional feature joins the form.
  const steps = [...(classDates.length > 0 ? ['classDate'] : []), 'name', 'email', 'phone', 'optional']
  const TOTAL_STEPS = steps.length
  const [proofUrl, setProofUrl] = useState('')
  const [proofUploadState, setProofUploadState] = useState('idle')
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [values, setValues] = useState({
    classDate: '',
    name: '',
    email: '',
    phone: '',
    business: '',
    role: '',
    participants: '1',
    hearAbout: '',
    message: '',
  })
  const activeInputRef = useRef(null)
  // A honeypot real visitors never see (bots that fill every input they
  // find will fill it) and the mount time (real completion, even fast, has
  // a floor a scripted POST doesn't) — both checked server-side in
  // submitInquiryAction, never enforced here, since a client-side-only
  // check is trivial for a bot to just skip.
  const honeypotRef = useRef(null)
  // Lazy initializer, not `useRef(Date.now())` — the latter calls Date.now()
  // directly in the render body on every render (React only keeps the
  // first result, but still evaluates the impure call each time); the
  // function form only ever runs once, on mount.
  const [startedAt] = useState(() => Date.now())

  const currentStepKey = steps[step]
  const selectedClass = classDates.find((d) => d.date === values.classDate)
  const isWaitlist = Boolean(selectedClass?.isFull)

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleProofUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setProofUploadState('uploading')
    try {
      const formData = new FormData()
      formData.set('file', file)
      const res = await fetch('/api/upload-payment-proof', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      setProofUrl(data.url)
      setProofUploadState('done')
    } catch {
      setProofUploadState('error')
    }
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

  // The actual submit control below is type="button", not type="submit" —
  // on purpose. A previous version used type="submit" and tried to stop
  // Enter from triggering it via a keydown handler, which worked for a
  // real keyboard's Enter key but not reliably for every mobile keyboard's
  // "Go"/"Done" action key, which can trigger a form's native implicit
  // submission without going through a JS-visible Enter keydown at all —
  // landing on the last (optional-fields) step, whatever was typed so far,
  // with no chance to actually see or finish that step. With no
  // type="submit" element anywhere in the form, there is nothing for the
  // browser to implicitly activate — submission only ever happens through
  // this function, called directly from the button's onClick.
  function submitForm() {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.set(key, value))
    formData.set('website', honeypotRef.current?.value || '')
    formData.set('formStartedAt', String(startedAt))
    formData.set('paymentProofUrl', proofUrl)
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
          {state.waitlisted ? dict.workshop.formWaitlistSuccessTitle : dict.workshop.formSuccessTitle}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.38, ease: EASE }}
          className="mt-2 text-sm text-muted dark:text-neutral-400"
        >
          {state.waitlisted ? dict.workshop.formWaitlistSuccessBody : dict.workshop.formSuccessBody}
        </motion.p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Honeypot: invisible and unreachable by tab or screen reader for a
          real visitor, but present in the DOM for a bot that fills every
          field it finds. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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
            {currentStepKey === 'classDate' && (
              <div>
                <label className={labelClass} htmlFor="classDate">
                  {dict.workshop.formClassDate}
                </label>
                <select
                  ref={activeInputRef}
                  id="classDate"
                  required
                  autoFocus
                  value={values.classDate}
                  onChange={(e) => update('classDate', e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {dict.workshop.formClassDatePick}
                  </option>
                  {classDates.map((d) => (
                    <option key={d.id} value={d.date}>
                      {formatClassDate(d.date, dict.locale.dateLocale)}
                      {d.label ? ` — ${d.label}` : ''}
                      {d.seatsLeft !== undefined && ` (${d.isFull ? dict.workshop.formFull : `${d.seatsLeft} ${dict.workshop.formSeatsLeft}`})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentStepKey === 'name' && (
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

            {currentStepKey === 'email' && (
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

            {currentStepKey === 'phone' && (
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

            {currentStepKey === 'optional' && (
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
                  <label className={labelClass} htmlFor="hearAbout">
                    {dict.workshop.formHearAbout}
                  </label>
                  <select
                    id="hearAbout"
                    value={values.hearAbout}
                    onChange={(e) => update('hearAbout', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{dict.workshop.formHearAboutPick}</option>
                    <option value="facebook">{dict.workshop.formHearAboutFacebook}</option>
                    <option value="instagram">{dict.workshop.formHearAboutInstagram}</option>
                    <option value="tiktok">{dict.workshop.formHearAboutTiktok}</option>
                    <option value="referral">{dict.workshop.formHearAboutReferral}</option>
                    <option value="search">{dict.workshop.formHearAboutSearch}</option>
                    <option value="other">{dict.workshop.formHearAboutOther}</option>
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

                {paymentMethods.length > 0 && (
                  <div className="space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                    {isWaitlist && (
                      <p className="rounded-md bg-neutral-100 px-3 py-2 text-xs text-muted dark:bg-white/5 dark:text-neutral-400">
                        {dict.workshop.formWaitlistNote}
                      </p>
                    )}
                    <p className={`font-display text-sm font-bold text-ink ${italicIfLatin(locale)}`}>
                      {dict.workshop.formPaymentHeading}
                    </p>
                    <div className="space-y-3">
                      {paymentMethods.map((m, i) => (
                        <div key={i} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                          <p className="text-sm font-semibold text-ink dark:text-neutral-100">{m.name}</p>
                          <div className="mt-1.5 space-y-1">
                            <CopyRow
                              label={dict.workshop.formPaymentAccountName}
                              value={m.accountName}
                              copyLabel={dict.workshop.formPaymentCopy}
                              copiedLabel={dict.workshop.formPaymentCopied}
                            />
                            <CopyRow
                              label={dict.workshop.formPaymentAccountNumber}
                              value={m.accountNumber}
                              copyLabel={dict.workshop.formPaymentCopy}
                              copiedLabel={dict.workshop.formPaymentCopied}
                            />
                          </div>
                          {m.note && <p className="mt-2 text-xs text-muted dark:text-neutral-400">{m.note}</p>}
                          {m.qrImage && (
                            <img
                              src={m.qrImage}
                              alt={`${m.name} QR code`}
                              className="mt-2 h-32 w-32 rounded-lg border border-neutral-200 object-contain dark:border-neutral-700"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="paymentProof">
                        {dict.workshop.formPaymentUpload}
                      </label>
                      <input
                        id="paymentProof"
                        type="file"
                        accept="image/*"
                        onChange={handleProofUpload}
                        className="mt-1 block text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand dark:text-neutral-400"
                      />
                      {proofUploadState === 'uploading' && (
                        <p className="mt-1 text-xs text-muted dark:text-neutral-400">{dict.workshop.formPaymentUploading}</p>
                      )}
                      {proofUploadState === 'done' && <p className="mt-1 text-xs text-brand">{dict.workshop.formPaymentUploaded}</p>}
                      {proofUploadState === 'error' && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{dict.workshop.formPaymentUploadError}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted dark:text-neutral-400">{dict.workshop.formPaymentSkipHint}</p>
                  </div>
                )}
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
            type="button"
            onClick={submitForm}
            disabled={pending}
            whileHover={pending ? {} : { scale: 1.04, boxShadow: '0 10px 25px -8px rgba(232,54,6,0.55)' }}
            whileTap={pending ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.6 }}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? dict.workshop.formSubmitting : isWaitlist ? dict.workshop.formWaitlistSubmit : dict.workshop.formSubmit}
          </motion.button>
        )}
      </div>
    </form>
  )
}
