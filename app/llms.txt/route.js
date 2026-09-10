import { SITE_URL, SITE_NAME, SOCIAL_LINKS } from '../../lib/site'
import { getPosts } from '../../lib/blog'

export async function GET() {
  const posts = await getPosts()

  const postLines = posts.length
    ? posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt ?? ''}`).join('\n')
    : '- No articles published yet.'

  const body = `# ${SITE_NAME}

> Brand strategist working at the intersection of brand, content, digital experience, and business growth. Helps businesses turn ideas into brands, brands into systems, and systems into growth.

${SITE_NAME} is a brand strategist and the creator of the LGS (Launch · Grow · Scale) framework, a strategic workshop for Myanmar SME owners. Areas of work: brand positioning, digital marketing strategy, content systems, and digital experience design. Founder of Dubai Directory and Thailand Directory, community-driven discovery platforms for the Myanmar diaspora.

## Pages

- [Home](${SITE_URL}): Services, background, and current work.
- [Articles](${SITE_URL}/blog): Writing on brand strategy, marketing, and growth.

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
