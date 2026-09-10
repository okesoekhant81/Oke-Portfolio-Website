const richText = {
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      marks: {
        decorators: [
          { title: 'Emphasis (serif)', value: 'em' },
          { title: 'Bold italic (serif)', value: 'strong' },
        ],
      },
    },
  ],
}

export default {
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'marketing', title: 'Not Just Marketing' },
    { name: 'services', title: 'Services' },
    { name: 'strategy', title: 'Strategy' },
    { name: 'building', title: "Thing I'm Building" },
    { name: 'workshop', title: 'Workshop' },
    { name: 'about', title: 'About Me' },
    { name: 'contact', title: 'Contact' },
  ],
  fields: [
    // Hero
    { name: 'heroName', title: 'Name (e.g. "Oke")', type: 'string', group: 'hero' },
    { name: 'heroBody', title: 'Intro paragraphs', ...richText, group: 'hero' },
    { name: 'heroBadgePrefix', title: 'Badge prefix (e.g. "It\'s")', type: 'string', group: 'hero' },
    { name: 'heroBadgeEmphasis', title: 'Badge emphasis (e.g. "Heart Work!")', type: 'string', group: 'hero' },
    { name: 'heroImage', title: 'Hero photo', type: 'image', group: 'hero' },

    // Not Just Marketing
    { name: 'marketingLine1', title: 'Heading line 1', type: 'string', group: 'marketing' },
    { name: 'marketingLine2', title: 'Heading line 2 (accent)', type: 'string', group: 'marketing' },
    { name: 'marketingBody', title: 'Body paragraphs', ...richText, group: 'marketing' },

    // Services
    {
      name: 'services',
      title: 'Services',
      type: 'array',
      group: 'services',
      of: [
        {
          type: 'object',
          name: 'service',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'copy', title: 'Copy', type: 'text' },
            { name: 'image', title: 'Background image', type: 'image' },
          ],
          preview: { select: { title: 'title', media: 'image' } },
        },
      ],
    },

    // Strategy
    { name: 'strategyLine1', title: 'Heading line 1', type: 'string', group: 'strategy' },
    { name: 'strategyLine2', title: 'Heading line 2 (accent)', type: 'string', group: 'strategy' },
    { name: 'strategyParagraph', title: 'Paragraph', type: 'text', group: 'strategy' },
    { name: 'strategyQuote', title: 'Quote', type: 'string', group: 'strategy' },

    // Thing I'm Building
    { name: 'buildingLine1', title: 'Heading line 1', type: 'string', group: 'building' },
    { name: 'buildingLine2', title: 'Heading line 2 (accent)', type: 'string', group: 'building' },
    { name: 'buildingIntro', title: 'Intro line', type: 'string', group: 'building' },
    { name: 'buildingEmphasis', title: 'Intro emphasis', type: 'string', group: 'building' },
    {
      name: 'projects',
      title: 'Projects',
      type: 'array',
      group: 'building',
      of: [
        {
          type: 'object',
          name: 'project',
          fields: [
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'logo', title: 'Logo', type: 'image' },
            { name: 'location', title: 'Location phrase', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' },
            { name: 'role', title: 'Role', type: 'string' },
          ],
          preview: { select: { title: 'name', media: 'logo' } },
        },
      ],
    },

    // Workshop
    { name: 'workshopImage', title: 'Background photo', type: 'image', group: 'workshop' },
    { name: 'workshopLine1', title: 'Heading line 1 (accent)', type: 'string', group: 'workshop' },
    { name: 'workshopLine2', title: 'Heading line 2', type: 'string', group: 'workshop' },
    { name: 'workshopBody', title: 'Body paragraphs', ...richText, group: 'workshop' },
    { name: 'workshopRole', title: 'Role line', type: 'string', group: 'workshop' },

    // About Me
    { name: 'aboutLine1', title: 'Heading line 1', type: 'string', group: 'about' },
    { name: 'aboutLine2', title: 'Heading line 2 (accent)', type: 'string', group: 'about' },
    { name: 'aboutBody', title: 'Body paragraphs', ...richText, group: 'about' },

    // Contact
    { name: 'contactLine1', title: 'Heading line 1', type: 'string', group: 'contact' },
    { name: 'contactLine2', title: 'Heading line 2 (accent)', type: 'string', group: 'contact' },
    { name: 'contactBody', title: 'Body paragraph', ...richText, group: 'contact' },
    { name: 'contactCta', title: 'CTA line (e.g. "Let\'s Start a Conversation")', type: 'string', group: 'contact' },
    { name: 'contactEmail', title: 'Email', type: 'string', group: 'contact' },
    { name: 'contactCopyright', title: 'Copyright line', type: 'string', group: 'contact' },
    { name: 'contactTagline', title: 'Tagline', type: 'string', group: 'contact' },
  ],
  preview: {
    prepare() {
      return { title: 'Homepage content' }
    },
  },
}
