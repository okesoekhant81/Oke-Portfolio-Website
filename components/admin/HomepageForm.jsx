'use client'

import { createContext, useActionState, useContext, useState } from 'react'
import { saveHomepage } from '../../app/actions/homepage'
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

export default function HomepageForm({ content }) {
  const [state, formAction, pending] = useActionState(saveHomepage, null)
  const [formLocale, setFormLocale] = useState('en')

  return (
    <FormLocaleContext.Provider value={formLocale}>
      <form action={formAction}>
        <LanguageTabs value={formLocale} onChange={setFormLocale} />

        <Section title="Hero">
          <Field label="Name (e.g. Oke)" name="heroName" defaultValue={content.heroName} />
          <TextArea
            label="Intro"
            name="heroBody"
            defaultValue={content.heroBody}
            nameMy="heroBodyMy"
            defaultValueMy={content.heroBodyMy}
            rows={5}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Badge prefix"
              name="heroBadgePrefix"
              defaultValue={content.heroBadgePrefix}
              nameMy="heroBadgePrefixMy"
              defaultValueMy={content.heroBadgePrefixMy}
            />
            <Field
              label="Badge emphasis"
              name="heroBadgeEmphasis"
              defaultValue={content.heroBadgeEmphasis}
              nameMy="heroBadgeEmphasisMy"
              defaultValueMy={content.heroBadgeEmphasisMy}
            />
          </div>
          <ImageField label="Hero photo" name="heroImage" defaultValue={content.heroImage} />
        </Section>

        <Section title="Not Just Marketing">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Heading line 1"
              name="marketingLine1"
              defaultValue={content.marketingLine1}
              nameMy="marketingLine1My"
              defaultValueMy={content.marketingLine1My}
            />
            <Field
              label="Heading line 2 (accent)"
              name="marketingLine2"
              defaultValue={content.marketingLine2}
              nameMy="marketingLine2My"
              defaultValueMy={content.marketingLine2My}
            />
          </div>
          <TextArea
            label="Body"
            name="marketingBody"
            defaultValue={content.marketingBody}
            nameMy="marketingBodyMy"
            defaultValueMy={content.marketingBodyMy}
            rows={4}
          />
        </Section>

        <Section title="Services">
          {content.services.map((service, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 p-4">
              <p className="text-xs font-semibold text-neutral-400">Service {i + 1}</p>
              <div className="mt-2 space-y-3">
                <Field
                  label="Title"
                  name={`service-${i}-title`}
                  defaultValue={service.title}
                  nameMy={`service-${i}-titleMy`}
                  defaultValueMy={service.titleMy}
                />
                <TextArea
                  label="Copy"
                  name={`service-${i}-copy`}
                  defaultValue={service.copy}
                  nameMy={`service-${i}-copyMy`}
                  defaultValueMy={service.copyMy}
                  rows={3}
                />
                <ImageField label="Image" name={`service-${i}-image`} defaultValue={service.image} />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Strategy Before Tactics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Heading line 1"
              name="strategyLine1"
              defaultValue={content.strategyLine1}
              nameMy="strategyLine1My"
              defaultValueMy={content.strategyLine1My}
            />
            <Field
              label="Heading line 2 (accent)"
              name="strategyLine2"
              defaultValue={content.strategyLine2}
              nameMy="strategyLine2My"
              defaultValueMy={content.strategyLine2My}
            />
          </div>
          <TextArea
            label="Paragraph"
            name="strategyParagraph"
            defaultValue={content.strategyParagraph}
            nameMy="strategyParagraphMy"
            defaultValueMy={content.strategyParagraphMy}
            rows={2}
          />
          <Field
            label="Quote"
            name="strategyQuote"
            defaultValue={content.strategyQuote}
            nameMy="strategyQuoteMy"
            defaultValueMy={content.strategyQuoteMy}
          />
        </Section>

        <Section title="Thing I'm Building">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Heading line 1"
              name="buildingLine1"
              defaultValue={content.buildingLine1}
              nameMy="buildingLine1My"
              defaultValueMy={content.buildingLine1My}
            />
            <Field
              label="Heading line 2 (accent)"
              name="buildingLine2"
              defaultValue={content.buildingLine2}
              nameMy="buildingLine2My"
              defaultValueMy={content.buildingLine2My}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Intro"
              name="buildingIntro"
              defaultValue={content.buildingIntro}
              nameMy="buildingIntroMy"
              defaultValueMy={content.buildingIntroMy}
            />
            <Field
              label="Intro emphasis"
              name="buildingEmphasis"
              defaultValue={content.buildingEmphasis}
              nameMy="buildingEmphasisMy"
              defaultValueMy={content.buildingEmphasisMy}
            />
          </div>
          {content.projects.map((project, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 p-4">
              <p className="text-xs font-semibold text-neutral-400">Project {i + 1}</p>
              <div className="mt-2 space-y-3">
                <Field label="Name" name={`project-${i}-name`} defaultValue={project.name} />
                <Field
                  label="Location phrase"
                  name={`project-${i}-location`}
                  defaultValue={project.location}
                  nameMy={`project-${i}-locationMy`}
                  defaultValueMy={project.locationMy}
                />
                <TextArea
                  label="Description"
                  name={`project-${i}-description`}
                  defaultValue={project.description}
                  nameMy={`project-${i}-descriptionMy`}
                  defaultValueMy={project.descriptionMy}
                  rows={2}
                />
                <Field
                  label="Role"
                  name={`project-${i}-role`}
                  defaultValue={project.role}
                  nameMy={`project-${i}-roleMy`}
                  defaultValueMy={project.roleMy}
                />
                <ImageField label="Logo" name={`project-${i}-logo`} defaultValue={project.logo} />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Workshop">
          <ImageField label="Background photo" name="workshopImage" defaultValue={content.workshopImage} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Heading line 1 (accent)"
              name="workshopLine1"
              defaultValue={content.workshopLine1}
              nameMy="workshopLine1My"
              defaultValueMy={content.workshopLine1My}
            />
            <Field
              label="Heading line 2"
              name="workshopLine2"
              defaultValue={content.workshopLine2}
              nameMy="workshopLine2My"
              defaultValueMy={content.workshopLine2My}
            />
          </div>
          <TextArea
            label="Body"
            name="workshopBody"
            defaultValue={content.workshopBody}
            nameMy="workshopBodyMy"
            defaultValueMy={content.workshopBodyMy}
            rows={4}
          />
          <Field
            label="Role line"
            name="workshopRole"
            defaultValue={content.workshopRole}
            nameMy="workshopRoleMy"
            defaultValueMy={content.workshopRoleMy}
          />
        </Section>

        <Section title="About Me">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Heading line 1"
              name="aboutLine1"
              defaultValue={content.aboutLine1}
              nameMy="aboutLine1My"
              defaultValueMy={content.aboutLine1My}
            />
            <Field
              label="Heading line 2 (accent)"
              name="aboutLine2"
              defaultValue={content.aboutLine2}
              nameMy="aboutLine2My"
              defaultValueMy={content.aboutLine2My}
            />
          </div>
          <TextArea
            label="Body"
            name="aboutBody"
            defaultValue={content.aboutBody}
            nameMy="aboutBodyMy"
            defaultValueMy={content.aboutBodyMy}
            rows={8}
          />
        </Section>

        <Section title="Contact">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Heading line 1"
              name="contactLine1"
              defaultValue={content.contactLine1}
              nameMy="contactLine1My"
              defaultValueMy={content.contactLine1My}
            />
            <Field
              label="Heading line 2 (accent)"
              name="contactLine2"
              defaultValue={content.contactLine2}
              nameMy="contactLine2My"
              defaultValueMy={content.contactLine2My}
            />
          </div>
          <TextArea
            label="Body"
            name="contactBody"
            defaultValue={content.contactBody}
            nameMy="contactBodyMy"
            defaultValueMy={content.contactBodyMy}
            rows={2}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="CTA line"
              name="contactCta"
              defaultValue={content.contactCta}
              nameMy="contactCtaMy"
              defaultValueMy={content.contactCtaMy}
            />
            <Field label="Email" name="contactEmail" defaultValue={content.contactEmail} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Copyright line"
              name="contactCopyright"
              defaultValue={content.contactCopyright}
              nameMy="contactCopyrightMy"
              defaultValueMy={content.contactCopyrightMy}
            />
            <Field
              label="Tagline"
              name="contactTagline"
              defaultValue={content.contactTagline}
              nameMy="contactTaglineMy"
              defaultValueMy={content.contactTaglineMy}
            />
          </div>
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
