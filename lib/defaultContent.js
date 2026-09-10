import heroOke from '../assets/img/hero-oke.webp'
import brandPositioning from '../assets/img/brand-positioning.jpg'
import growthMarketing from '../assets/img/growth-marketing.jpg'
import contentSystems from '../assets/img/content-systems.jpg'
import digitalExperiences from '../assets/img/digital-experiences.jpg'
import dubaiLogo from '../assets/img/dubai-directory-logo.png'
import thailandLogo from '../assets/img/thailand-directory-logo.png'
import workshopImg from '../assets/img/workshop.jpg'

let keyCounter = 0

// Builds a Sanity-shaped Portable Text block from plain strings or
// { text, marks } spans, so the bundled fallback content renders through
// the exact same <RichText> path as real CMS data.
function block(spans) {
  return {
    _type: 'block',
    _key: `block-${keyCounter++}`,
    style: 'normal',
    children: spans.map((s) => {
      const span = typeof s === 'string' ? { text: s, marks: [] } : { text: s.text, marks: s.marks || [] }
      return { _type: 'span', _key: `span-${keyCounter++}`, ...span }
    }),
  }
}

export const defaultContent = {
  heroName: 'Oke',
  heroBody: [
    block([
      'work at the ',
      { text: 'intersection', marks: ['em'] },
      ' of brand, content, digital experiences, and business growth. I help turn ',
      { text: 'ideas', marks: ['em'] },
      ' into ',
      { text: 'brands', marks: ['em'] },
      ', brands into systems, and systems into businesses that can grow.',
    ]),
    block([
      'I turn standard businesses into powerful brands. By aligning brand strategy with advanced digital marketing, custom website/app development, and automated digital solutions, I build the system for your market expansion.',
    ]),
  ],
  heroBadgePrefix: "It's",
  heroBadgeEmphasis: 'Heart Work!',
  heroImageFallback: heroOke,

  marketingLine1: 'Not Just',
  marketingLine2: 'Marketing',
  marketingBody: [
    block([
      "I'm interested in the whole ",
      { text: 'system behind growth', marks: ['em'] },
      '. The ',
      { text: 'brand people remember', marks: ['em'] },
      '. The ',
      { text: 'message that makes them care', marks: ['em'] },
      '. The ',
      { text: 'content that earns attention', marks: ['em'] },
      '. The ',
      { text: 'digital experience that moves them forward', marks: ['em'] },
      '. And ',
      { text: 'the business thinking that connects everything together.', marks: ['em'] },
    ]),
    block([
      "That's why my work usually sits somewhere between ",
      { text: 'strategy, marketing, content, product, and execution.', marks: ['em'] },
    ]),
  ],

  services: [
    {
      title: 'Brand and Positioning',
      copy: 'Finding the clearest answer to why should people choose this brand? I work on positioning, messaging, audience understanding, offers, brand direction, and how the brand should show up in the market.',
      imageFallback: brandPositioning,
    },
    {
      title: 'Growth and Digital Marketing',
      copy: 'Marketing should solve a business problem not simply keep a social media page active. I build strategies around awareness, acquisition, conversion, customer journeys, and growth opportunities.',
      imageFallback: growthMarketing,
    },
    {
      title: 'Content Systems',
      copy: 'I don’t think of content as individual posts. I think about the system behind them. From founder-led content to campaign calendars and repeatable content frameworks, I build content around business objectives.',
      imageFallback: contentSystems,
    },
    {
      title: 'Digital Experiences',
      copy: 'Sometimes the problem isn’t the campaign. It’s what happens after someone clicks. I work on websites, landing experiences, information architecture, digital journeys, and ideas that turn attention into action.',
      imageFallback: digitalExperiences,
    },
  ],

  strategyLine1: 'Strategy',
  strategyLine2: 'Before Tactics.',
  strategyParagraph: 'A new campaign, content format, platform, or tool is rarely the first answer.',
  strategyQuote: 'Understanding the problem is.',

  buildingLine1: 'Thing',
  buildingLine2: "I'm Building",
  buildingIntro: "I don't only work on brands.",
  buildingEmphasis: 'I like building things too.',
  projects: [
    {
      name: 'Dubai Directory',
      location: 'Myanmar community in Dubai',
      description:
        'Bringing useful businesses, services, information, and local discoveries into one community-driven ecosystem.',
      role: 'Founder / Brand / Product / Growth',
      logoFallback: dubaiLogo,
    },
    {
      name: 'Thailand Directory',
      location: 'Myanmar community in Thailand',
      description:
        'Bringing useful businesses, services, information, and local discoveries into one community-driven ecosystem.',
      role: 'Founder / Brand / Product / Growth',
      logoFallback: thailandLogo,
    },
  ],

  workshopImageFallback: workshopImg,
  workshopLine1: 'Strategic Workshop',
  workshopLine2: 'For Myanmar SME Owners',
  workshopBody: [
    block(['From doing marketing to thinking strategically about growth.']),
    block([
      'A practical workshop for Myanmar SME owners built around my ',
      { text: 'LGS — Launch · Grow · Scale Framework', marks: ['strong'] },
      ', connecting business fundamentals, customer understanding, branding, marketing, and growth into one structured journey.',
    ]),
  ],
  workshopRole: 'Framework Creator / Strategist / Workshop Instructor',

  aboutLine1: 'About me',
  aboutLine2: 'You Need To Know',
  aboutBody: [
    block([
      'I like figuring out why things work. My work started around marketing and digital execution, but over time I became more interested in the questions behind the execution.',
    ]),
    block([{ text: 'Why do people choose one brand over another?', marks: ['em'] }]),
    block([{ text: 'Why does one message spread while another gets ignored?', marks: ['em'] }]),
    block([
      'Those questions pulled me deeper into strategy, branding, content, digital products, and business growth. Today, I work at the intersection of brand, content, digital experiences, and business growth.',
    ]),
    block([
      'The goal is to ',
      { text: '“Understand the problem. Build the right system. Make it work”', marks: ['strong'] },
    ]),
  ],

  contactLine1: "Let's Build",
  contactLine2: 'Something Useful',
  contactBody: [
    block([
      { text: 'Have a business problem, project, collaboration, or idea worth exploring?', marks: ['strong'] },
      " I'd like to hear about it.",
    ]),
  ],
  contactCta: "Let's Start a Conversation",
  contactEmail: 'hello@okesoekhant.com',
  contactCopyright: '© Oke Soe Khant',
  contactTagline: 'Strategy / Brands / Marketing / Building',
}
