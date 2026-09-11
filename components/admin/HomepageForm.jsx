'use client'

import { useActionState } from 'react'
import { saveHomepage } from '../../app/actions/homepage'
import ImageField from './ImageField'

function Section({ title, children }) {
  return (
    <fieldset className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
      <legend className="px-1 font-display text-base font-bold italic text-brand">{title}</legend>
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  )
}

function Field({ label, name, defaultValue }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  )
}

function TextArea({ label, name, defaultValue, rows = 4 }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  )
}

export default function HomepageForm({ content }) {
  const [state, formAction, pending] = useActionState(saveHomepage, null)

  return (
    <form action={formAction}>
      <Section title="Hero">
        <Field label="Name (e.g. Oke)" name="heroName" defaultValue={content.heroName} />
        <TextArea label="Intro" name="heroBody" defaultValue={content.heroBody} rows={5} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Badge prefix" name="heroBadgePrefix" defaultValue={content.heroBadgePrefix} />
          <Field label="Badge emphasis" name="heroBadgeEmphasis" defaultValue={content.heroBadgeEmphasis} />
        </div>
        <ImageField label="Hero photo" name="heroImage" defaultValue={content.heroImage} />
      </Section>

      <Section title="Not Just Marketing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heading line 1" name="marketingLine1" defaultValue={content.marketingLine1} />
          <Field label="Heading line 2 (accent)" name="marketingLine2" defaultValue={content.marketingLine2} />
        </div>
        <TextArea label="Body" name="marketingBody" defaultValue={content.marketingBody} rows={4} />
      </Section>

      <Section title="Services">
        {content.services.map((service, i) => (
          <div key={i} className="rounded-lg border border-neutral-100 p-4">
            <p className="text-xs font-semibold text-neutral-400">Service {i + 1}</p>
            <div className="mt-2 space-y-3">
              <Field label="Title" name={`service-${i}-title`} defaultValue={service.title} />
              <TextArea label="Copy" name={`service-${i}-copy`} defaultValue={service.copy} rows={3} />
              <ImageField label="Image" name={`service-${i}-image`} defaultValue={service.image} />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Strategy Before Tactics">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heading line 1" name="strategyLine1" defaultValue={content.strategyLine1} />
          <Field label="Heading line 2 (accent)" name="strategyLine2" defaultValue={content.strategyLine2} />
        </div>
        <TextArea label="Paragraph" name="strategyParagraph" defaultValue={content.strategyParagraph} rows={2} />
        <Field label="Quote" name="strategyQuote" defaultValue={content.strategyQuote} />
      </Section>

      <Section title="Thing I'm Building">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heading line 1" name="buildingLine1" defaultValue={content.buildingLine1} />
          <Field label="Heading line 2 (accent)" name="buildingLine2" defaultValue={content.buildingLine2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Intro" name="buildingIntro" defaultValue={content.buildingIntro} />
          <Field label="Intro emphasis" name="buildingEmphasis" defaultValue={content.buildingEmphasis} />
        </div>
        {content.projects.map((project, i) => (
          <div key={i} className="rounded-lg border border-neutral-100 p-4">
            <p className="text-xs font-semibold text-neutral-400">Project {i + 1}</p>
            <div className="mt-2 space-y-3">
              <Field label="Name" name={`project-${i}-name`} defaultValue={project.name} />
              <Field label="Location phrase" name={`project-${i}-location`} defaultValue={project.location} />
              <TextArea label="Description" name={`project-${i}-description`} defaultValue={project.description} rows={2} />
              <Field label="Role" name={`project-${i}-role`} defaultValue={project.role} />
              <ImageField label="Logo" name={`project-${i}-logo`} defaultValue={project.logo} />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Workshop">
        <ImageField label="Background photo" name="workshopImage" defaultValue={content.workshopImage} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heading line 1 (accent)" name="workshopLine1" defaultValue={content.workshopLine1} />
          <Field label="Heading line 2" name="workshopLine2" defaultValue={content.workshopLine2} />
        </div>
        <TextArea label="Body" name="workshopBody" defaultValue={content.workshopBody} rows={4} />
        <Field label="Role line" name="workshopRole" defaultValue={content.workshopRole} />
      </Section>

      <Section title="About Me">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heading line 1" name="aboutLine1" defaultValue={content.aboutLine1} />
          <Field label="Heading line 2 (accent)" name="aboutLine2" defaultValue={content.aboutLine2} />
        </div>
        <TextArea label="Body" name="aboutBody" defaultValue={content.aboutBody} rows={8} />
      </Section>

      <Section title="Contact">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heading line 1" name="contactLine1" defaultValue={content.contactLine1} />
          <Field label="Heading line 2 (accent)" name="contactLine2" defaultValue={content.contactLine2} />
        </div>
        <TextArea label="Body" name="contactBody" defaultValue={content.contactBody} rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="CTA line" name="contactCta" defaultValue={content.contactCta} />
          <Field label="Email" name="contactEmail" defaultValue={content.contactEmail} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Copyright line" name="contactCopyright" defaultValue={content.contactCopyright} />
          <Field label="Tagline" name="contactTagline" defaultValue={content.contactTagline} />
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
  )
}
