'use client'

import { useActionState, useEffect, useState } from 'react'
import { saveHomepage } from '../../app/actions/homepage'
import { FormLocaleContext, LockContext, Section, Field, TextArea, LanguageTabs } from './ContentFormFields'
import ImageField from './ImageField'
import SaveBar from './SaveBar'

export default function HomepageForm({ content }) {
  const [state, formAction, pending] = useActionState(saveHomepage, null)
  const [formLocale, setFormLocale] = useState('en')
  const [locked, setLocked] = useState(true)
  const [formKey, setFormKey] = useState(0)

  // Relock the instant a save succeeds — the whole point is that "editable"
  // and "just saved, now view-only" never look the same.
  useEffect(() => {
    if (state?.success) setLocked(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.savedAt])

  function handleCancel() {
    // Remounts the form fresh from `content` (the last saved state),
    // discarding whatever was typed since Edit was clicked.
    setFormKey((k) => k + 1)
    setLocked(true)
  }

  return (
    <FormLocaleContext.Provider value={formLocale}>
      <LockContext.Provider value={locked}>
        <form key={formKey} action={formAction}>
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

        <SaveBar locked={locked} onEdit={() => setLocked(false)} onCancel={handleCancel} pending={pending} state={state} />
        </form>
      </LockContext.Provider>
    </FormLocaleContext.Provider>
  )
}
