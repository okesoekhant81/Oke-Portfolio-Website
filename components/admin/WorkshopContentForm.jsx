'use client'

import { createContext, useActionState, useContext, useState } from 'react'
import { saveWorkshop } from '../../app/actions/workshopContent'
import ImageField from './ImageField'

const FormLocaleContext = createContext('en')

function Section({ title, children }) {
  return (
    <fieldset className="mt-8 min-w-0 rounded-xl border border-neutral-200 bg-white p-6">
      <legend className="px-1 font-display text-base font-bold italic text-brand">{title}</legend>
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  )
}

// When `nameMy` is given, both language inputs stay mounted (so switching
// tabs never loses what you typed) and only the active one is shown —
// hidden inputs still submit with the form, so one Save writes both.
function Field({ label, name, defaultValue, nameMy, defaultValueMy }) {
  const formLocale = useContext(FormLocaleContext)
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
          nameMy && formLocale !== 'en' ? 'hidden' : ''
        }`}
      />
      {nameMy && (
        <input
          name={nameMy}
          defaultValue={defaultValueMy}
          placeholder="မြန်မာလို ရေးပါ…"
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
            formLocale !== 'my' ? 'hidden' : ''
          }`}
        />
      )}
    </div>
  )
}

function TextArea({ label, name, defaultValue, nameMy, defaultValueMy, rows = 4 }) {
  const formLocale = useContext(FormLocaleContext)
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
          nameMy && formLocale !== 'en' ? 'hidden' : ''
        }`}
      />
      {nameMy && (
        <textarea
          name={nameMy}
          defaultValue={defaultValueMy}
          rows={rows}
          placeholder="မြန်မာလို ရေးပါ…"
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
            formLocale !== 'my' ? 'hidden' : ''
          }`}
        />
      )}
    </div>
  )
}

function LanguageTabs({ value, onChange }) {
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

export default function WorkshopContentForm({ content }) {
  const [state, formAction, pending] = useActionState(saveWorkshop, null)
  const [formLocale, setFormLocale] = useState('en')

  return (
    <FormLocaleContext.Provider value={formLocale}>
      <form action={formAction}>
        <LanguageTabs value={formLocale} onChange={setFormLocale} />

        <Section title="Hero">
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

        <div className="sticky bottom-4 mt-8 flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save changes'}
          </button>
          {state?.success && <span className="text-sm text-green-600">Saved — live on the site now.</span>}
          {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        </div>
      </form>
    </FormLocaleContext.Provider>
  )
}
