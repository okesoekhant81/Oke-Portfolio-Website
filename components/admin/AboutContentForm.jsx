'use client'

import { useActionState, useEffect, useState } from 'react'
import { saveAbout } from '../../app/actions/about'
import { FormLocaleContext, LockContext, Section, Field, TextArea, LanguageTabs } from './ContentFormFields'
import SaveBar from './SaveBar'

export default function AboutContentForm({ content }) {
  const [state, formAction, pending] = useActionState(saveAbout, null)
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
          <Field
            label="Role line"
            name="roleLine"
            defaultValue={content.roleLine}
            nameMy="roleLineMy"
            defaultValueMy={content.roleLineMy}
          />
          <TextArea
            label="Intro"
            name="intro"
            defaultValue={content.intro}
            nameMy="introMy"
            defaultValueMy={content.introMy}
            rows={6}
          />
        </Section>

        <Section title="By the Numbers">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.stats.map((stat, i) => (
              <div key={i} className="rounded-lg border border-neutral-100 p-4">
                <p className="text-xs font-semibold text-neutral-400">Stat {i + 1}</p>
                <div className="mt-2 space-y-3">
                  <Field label="Value (e.g. 7+)" name={`stat-${i}-value`} defaultValue={stat.value} />
                  <Field
                    label="Label"
                    name={`stat-${i}-label`}
                    defaultValue={stat.label}
                    nameMy={`stat-${i}-labelMy`}
                    defaultValueMy={stat.labelMy}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Experience">
          <Field
            label="Section heading"
            name="experienceHeading"
            defaultValue={content.experienceHeading}
            nameMy="experienceHeadingMy"
            defaultValueMy={content.experienceHeadingMy}
          />
          {content.experience.map((exp, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 p-4">
              <p className="text-xs font-semibold text-neutral-400">Role {i + 1}</p>
              <div className="mt-2 space-y-3">
                <Field
                  label="Role"
                  name={`exp-${i}-role`}
                  defaultValue={exp.role}
                  nameMy={`exp-${i}-roleMy`}
                  defaultValueMy={exp.roleMy}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Company" name={`exp-${i}-company`} defaultValue={exp.company} />
                  <Field label="Period" name={`exp-${i}-period`} defaultValue={exp.period} />
                  <Field label="Location" name={`exp-${i}-location`} defaultValue={exp.location} />
                </div>
                <TextArea
                  label="Key achievement — one standout line, not a full bullet list"
                  name={`exp-${i}-achievement`}
                  defaultValue={exp.achievement}
                  nameMy={`exp-${i}-achievementMy`}
                  defaultValueMy={exp.achievementMy}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Skills">
          <Field
            label="Section heading"
            name="skillsHeading"
            defaultValue={content.skillsHeading}
            nameMy="skillsHeadingMy"
            defaultValueMy={content.skillsHeadingMy}
          />
          <TextArea
            label="Skills — comma-separated"
            name="skills"
            defaultValue={content.skills}
            nameMy="skillsMy"
            defaultValueMy={content.skillsMy}
            rows={3}
          />
        </Section>

        <SaveBar locked={locked} onEdit={() => setLocked(false)} onCancel={handleCancel} pending={pending} state={state} />
        </form>
      </LockContext.Provider>
    </FormLocaleContext.Provider>
  )
}
