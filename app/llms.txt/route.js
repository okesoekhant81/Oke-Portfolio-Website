import { SITE_URL, SITE_NAME, SOCIAL_LINKS } from '../../lib/site'
import { getPosts } from '../../lib/content/posts'
import { getWorkshopContent } from '../../lib/content/workshop'
import { getAboutContent } from '../../lib/content/about'
import { getTestimonials } from '../../lib/content/testimonials'

// Pulled from the same admin-managed content as the pages themselves
// (about stats/experience, workshop FAQ, client testimonials) rather than
// hardcoded, so this stays in sync automatically instead of quietly going
// stale whenever that content changes.
export async function GET() {
  const [posts, workshop, about, testimonials] = await Promise.all([
    getPosts(),
    getWorkshopContent(),
    getAboutContent(),
    getTestimonials(),
  ])

  const postLines = posts.length
    ? posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt ?? ''}`).join('\n')
    : '- No articles published yet.'

  const statLines = about.stats.filter((s) => s.value).map((s) => `- ${s.value} ${s.label}`).join('\n')
  const experienceLines = about.experience
    .filter((e) => e.role)
    .map((e) => `- ${e.role} at ${e.company} (${e.period}): ${e.achievement}`)
    .join('\n')
  const faqLines = workshop.faqs
    .filter((f) => f.question)
    .map((f) => `- Q: ${f.question}\n  A: ${f.answer}`)
    .join('\n')

  const workshopFacts = [workshop.format, workshop.duration, workshop.price].filter(Boolean).join(', ')
  const workshopMode = [
    workshop.sessionPlatform && `run via ${workshop.sessionPlatform}`,
    workshop.sessionLanguage && `in ${workshop.sessionLanguage}`,
  ]
    .filter(Boolean)
    .join(' ')
  const workshopSummary = [workshopFacts, workshopMode].filter(Boolean).join(', ')

  const approvedTestimonials = (testimonials || []).filter((t) => t.status !== 'pending' && t.quote)
  const testimonialLines = approvedTestimonials.length
    ? approvedTestimonials
        .map((t) => `- "${t.quote}" — ${t.name}${t.role ? `, ${t.role}` : ''} (${t.rating ?? 5}/5)`)
        .join('\n')
    : '- No testimonials published yet.'

  const body = `# ${SITE_NAME}

> Brand strategist working at the intersection of brand, content, digital experience, and business growth. Helps businesses turn ideas into brands, brands into systems, and systems into growth.

${SITE_NAME} is a Digital Marketing Manager and brand strategist, creator of the LGS (Launch · Grow · Scale) framework — a strategic workshop for Myanmar SME owners. Areas of work: brand positioning, digital marketing strategy, e-commerce, content systems, and digital experience design. Founder of Dubai Directory and Thailand Directory, community-driven discovery platforms for the Myanmar diaspora.

## By the Numbers

${statLines || '- Not published yet.'}

## Experience

${experienceLines || '- Not published yet.'}

## Testimonials

${testimonialLines}

## Pages

- [Home](${SITE_URL}): Services, background, and current work.
- [About](${SITE_URL}/about): Achievements, experience, and skills.
- [Workshop](${SITE_URL}/workshop): The LGS strategic workshop for Myanmar SME owners${workshopSummary ? ` — ${workshopSummary}` : ''}.
- [Articles](${SITE_URL}/blog): Writing on brand strategy, marketing, and growth.

## Workshop FAQ

${faqLines || '- No FAQ published yet.'}

## Articles

${postLines}

## Profiles

${SOCIAL_LINKS.map((url) => `- ${url}`).join('\n')}

## Contact

- Email: hello@okesoekhant.com
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
