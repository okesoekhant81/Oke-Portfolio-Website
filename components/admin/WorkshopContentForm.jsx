'use client'

import { useActionState, useEffect, useState } from 'react'
import { saveWorkshop } from '../../app/actions/workshopContent'
import { FormLocaleContext, LockContext, Section, Field, TextArea, LanguageTabs } from './ContentFormFields'
import ImageField from './ImageField'
import SaveBar from './SaveBar'

export default function WorkshopContentForm({ content }) {
  const [state, formAction, pending] = useActionState(saveWorkshop, null)
  const [formLocale, setFormLocale] = useState('en')
  const [locked, setLocked] = useState(true)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (state?.success) setLocked(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.savedAt])

  function handleCancel() {
    setFormKey((k) => k + 1)
    setLocked(true)
  }

  return (
    <FormLocaleContext.Provider value={formLocale}>
      <LockContext.Provider value={locked}>
        <form key={formKey} action={formAction}>
        <LanguageTabs value={formLocale} onChange={setFormLocale} />

        <Section title="Hero" defaultOpen>
          <ImageField label="Cover photo" name="heroImage" defaultValue={content.heroImage} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              name="heroTitle"
              defaultValue={content.heroTitle}
              nameMy="heroTitleMy"
              defaultValueMy={content.heroTitleMy}
            />
            <Field
              label="Subtitle (accent)"
              name="heroSubtitle"
              defaultValue={content.heroSubtitle}
              nameMy="heroSubtitleMy"
              defaultValueMy={content.heroSubtitleMy}
            />
          </div>
          <TextArea
            label="Intro"
            name="intro"
            defaultValue={content.intro}
            nameMy="introMy"
            defaultValueMy={content.introMy}
            rows={5}
          />
        </Section>

        <Section title="Highlights">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-3">
              <Field
                label="Label"
                name="formatLabel"
                defaultValue={content.formatLabel}
                nameMy="formatLabelMy"
                defaultValueMy={content.formatLabelMy}
              />
              <Field
                label="Value"
                name="format"
                defaultValue={content.format}
                nameMy="formatMy"
                defaultValueMy={content.formatMy}
              />
            </div>
            <div className="space-y-3">
              <Field
                label="Label"
                name="durationLabel"
                defaultValue={content.durationLabel}
                nameMy="durationLabelMy"
                defaultValueMy={content.durationLabelMy}
              />
              <Field
                label="Value"
                name="duration"
                defaultValue={content.duration}
                nameMy="durationMy"
                defaultValueMy={content.durationMy}
              />
            </div>
            <div className="space-y-3">
              <Field
                label="Label"
                name="audienceLabel"
                defaultValue={content.audienceLabel}
                nameMy="audienceLabelMy"
                defaultValueMy={content.audienceLabelMy}
              />
              <Field
                label="Value"
                name="audience"
                defaultValue={content.audience}
                nameMy="audienceMy"
                defaultValueMy={content.audienceMy}
              />
            </div>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Label"
              name="priceLabel"
              defaultValue={content.priceLabel}
              nameMy="priceLabelMy"
              defaultValueMy={content.priceLabelMy}
            />
            <Field
              label="Regular price"
              name="price"
              defaultValue={content.price}
              nameMy="priceMy"
              defaultValueMy={content.priceMy}
            />
          </div>
          <Field
            label="Promo price — leave blank to hide the promo (shows the regular price struck through next to this one)"
            name="promoPrice"
            defaultValue={content.promoPrice}
            nameMy="promoPriceMy"
            defaultValueMy={content.promoPriceMy}
          />
        </Section>

        <Section title="Course Outline">
          <Field
            label="Section heading"
            name="outlineHeading"
            defaultValue={content.outlineHeading}
            nameMy="outlineHeadingMy"
            defaultValueMy={content.outlineHeadingMy}
          />
          {content.modules.map((module, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 p-4">
              <p className="text-xs font-semibold text-neutral-400">Module {i + 1}</p>
              <div className="mt-2 space-y-3">
                <Field
                  label="Module title"
                  name={`module-${i}-title`}
                  defaultValue={module.title}
                  nameMy={`module-${i}-titleMy`}
                  defaultValueMy={module.titleMy}
                />
                <TextArea
                  label="Lessons — one per line"
                  name={`module-${i}-lessons`}
                  defaultValue={module.lessons}
                  nameMy={`module-${i}-lessonsMy`}
                  defaultValueMy={module.lessonsMy}
                  rows={8}
                />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Registration">
          <Field
            label="CTA heading"
            name="ctaHeading"
            defaultValue={content.ctaHeading}
            nameMy="ctaHeadingMy"
            defaultValueMy={content.ctaHeadingMy}
          />
          <TextArea
            label="CTA body"
            name="ctaBody"
            defaultValue={content.ctaBody}
            nameMy="ctaBodyMy"
            defaultValueMy={content.ctaBodyMy}
            rows={2}
          />
        </Section>

        <Section title="FAQ">
          <Field
            label="Section heading"
            name="faqHeading"
            defaultValue={content.faqHeading}
            nameMy="faqHeadingMy"
            defaultValueMy={content.faqHeadingMy}
          />
          {content.faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 p-4">
              <p className="text-xs font-semibold text-neutral-400">
                Question {i + 1} <span className="font-normal">(leave blank to skip)</span>
              </p>
              <div className="mt-2 space-y-3">
                <Field
                  label="Question"
                  name={`faq-${i}-question`}
                  defaultValue={faq.question}
                  nameMy={`faq-${i}-questionMy`}
                  defaultValueMy={faq.questionMy}
                />
                <TextArea
                  label="Answer"
                  name={`faq-${i}-answer`}
                  defaultValue={faq.answer}
                  nameMy={`faq-${i}-answerMy`}
                  defaultValueMy={faq.answerMy}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Payment Methods">
          <p className="text-xs text-neutral-400">
            Leave a method's Name blank to skip it — once at least one method has a name, the registration form shows
            a payment step listing every filled-in method (account number with a copy button, QR code if you add
            one) and asks registrants to upload proof of payment.
          </p>
          {[0, 1, 2, 3].map((i) => {
            const method = content.paymentMethods[i] || {}
            return (
              <div key={i} className="rounded-lg border border-neutral-100 p-4">
                <p className="text-xs font-semibold text-neutral-400">
                  Method {i + 1} <span className="font-normal">(leave Name blank to skip)</span>
                </p>
                <div className="mt-2 space-y-3">
                  <Field
                    label="Name (e.g. KBZPay, WavePay, Bank Transfer)"
                    name={`payment-${i}-name`}
                    defaultValue={method.name}
                    nameMy={`payment-${i}-nameMy`}
                    defaultValueMy={method.nameMy}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Account name" name={`payment-${i}-accountName`} defaultValue={method.accountName} />
                    <Field label="Account number" name={`payment-${i}-accountNumber`} defaultValue={method.accountNumber} />
                  </div>
                  <ImageField label="QR code (optional)" name={`payment-${i}-qrImage`} defaultValue={method.qrImage} />
                  <TextArea
                    label="Note (optional)"
                    name={`payment-${i}-note`}
                    defaultValue={method.note}
                    nameMy={`payment-${i}-noteMy`}
                    defaultValueMy={method.noteMy}
                    rows={2}
                  />
                </div>
              </div>
            )
          })}
        </Section>

        <Section title="Registration Email">
          <p className="text-xs text-neutral-400">
            Shown on the "registration confirmed" email a student gets once their payment is marked paid (see
            Students) — the same for every class, so date and time come from the class itself instead.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Location / platform"
              name="sessionPlatform"
              defaultValue={content.sessionPlatform}
              nameMy="sessionPlatformMy"
              defaultValueMy={content.sessionPlatformMy}
            />
            <Field
              label="Language"
              name="sessionLanguage"
              defaultValue={content.sessionLanguage}
              nameMy="sessionLanguageMy"
              defaultValueMy={content.sessionLanguageMy}
            />
          </div>
        </Section>

        <SaveBar locked={locked} onEdit={() => setLocked(false)} onCancel={handleCancel} pending={pending} state={state} />
        </form>
      </LockContext.Provider>
    </FormLocaleContext.Provider>
  )
}
