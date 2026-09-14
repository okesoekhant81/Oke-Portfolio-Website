import { readJson, writeJson, isBlobConfigured } from '../blobStore'
import { defaultAboutContent } from '../defaultAboutContent'

const PATH = 'content/about.json'

function resolveDefaults() {
  return {
    heroTitle: defaultAboutContent.heroTitle,
    heroTitleMy: defaultAboutContent.heroTitleMy,
    heroSubtitle: defaultAboutContent.heroSubtitle,
    heroSubtitleMy: defaultAboutContent.heroSubtitleMy,
    roleLine: defaultAboutContent.roleLine,
    roleLineMy: defaultAboutContent.roleLineMy,
    intro: defaultAboutContent.intro,
    introMy: defaultAboutContent.introMy,

    stats: defaultAboutContent.stats.map((s) => ({ value: s.value, label: s.label, labelMy: s.labelMy })),

    experienceHeading: defaultAboutContent.experienceHeading,
    experienceHeadingMy: defaultAboutContent.experienceHeadingMy,
    experience: defaultAboutContent.experience.map((e) => ({ ...e })),

    skillsHeading: defaultAboutContent.skillsHeading,
    skillsHeadingMy: defaultAboutContent.skillsHeadingMy,
    skills: defaultAboutContent.skills,
    skillsMy: defaultAboutContent.skillsMy,
  }
}

export async function getAboutContent() {
  const defaults = resolveDefaults()
  if (!isBlobConfigured) return defaults

  const saved = await readJson(PATH)
  if (!saved) return defaults

  return {
    ...defaults,
    ...saved,
    stats: saved.stats?.length ? saved.stats : defaults.stats,
    experience: saved.experience?.length ? saved.experience : defaults.experience,
  }
}

export async function saveAboutContent(data) {
  await writeJson(PATH, data)
}
