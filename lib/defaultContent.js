import heroOke from '../assets/img/hero-oke.webp'
import brandPositioning from '../assets/img/brand-positioning.jpg'
import growthMarketing from '../assets/img/growth-marketing.jpg'
import contentSystems from '../assets/img/content-systems.jpg'
import digitalExperiences from '../assets/img/digital-experiences.jpg'
import dubaiLogo from '../assets/img/dubai-directory-logo.png'
import thailandLogo from '../assets/img/thailand-directory-logo.png'
import workshopImg from '../assets/img/workshop.jpg'

// Body text uses a tiny markdown-lite syntax rendered by <RichText>:
// *word* -> serif emphasis, **word** -> bold italic serif. Paragraphs are
// separated by a blank line.
export const defaultContent = {
  heroName: 'Oke',
  heroBody: `work at the *intersection* of brand, content, digital experiences, and business growth. I help turn *ideas* into *brands*, brands into systems, and systems into businesses that can grow.

I turn standard businesses into powerful brands. By aligning brand strategy with advanced digital marketing, custom website/app development, and automated digital solutions, I build the system for your market expansion.`,
  heroBadgePrefix: "It's",
  heroBadgeEmphasis: 'Heart Work!',
  heroImageFallback: heroOke,

  marketingLine1: 'Not Just',
  marketingLine2: 'Marketing',
  marketingBody: `I'm interested in the whole *system behind growth*. The *brand people remember*. The *message that makes them care*. The *content that earns attention*. The *digital experience that moves them forward*. And *the business thinking that connects everything together.*

That's why my work usually sits somewhere between *strategy, marketing, content, product, and execution.*`,

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
  workshopBody: `From doing marketing to thinking strategically about growth.

A practical workshop for Myanmar SME owners built around my **LGS — Launch · Grow · Scale Framework**, connecting business fundamentals, customer understanding, branding, marketing, and growth into one structured journey.`,
  workshopRole: 'Framework Creator / Strategist / Workshop Instructor',

  aboutLine1: 'About me',
  aboutLine2: 'You Need To Know',
  aboutBody: `I like figuring out why things work. My work started around marketing and digital execution, but over time I became more interested in the questions behind the execution.

*Why do people choose one brand over another?*

*Why does one message spread while another gets ignored?*

Those questions pulled me deeper into strategy, branding, content, digital products, and business growth. Today, I work at the intersection of brand, content, digital experiences, and business growth.

The goal is to **"Understand the problem. Build the right system. Make it work"**`,

  contactLine1: "Let's Build",
  contactLine2: 'Something Useful',
  contactBody: `**Have a business problem, project, collaboration, or idea worth exploring?** I'd like to hear about it.`,
  contactCta: "Let's Start a Conversation",
  contactEmail: 'hello@okesoekhant.com',
  contactCopyright: '© Oke Soe Khant',
  contactTagline: 'Strategy / Brands / Marketing / Building',
}
