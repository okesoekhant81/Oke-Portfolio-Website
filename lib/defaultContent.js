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
//
// Every translatable field also has a "*My" counterpart (heroBody /
// heroBodyMy, etc.) — left blank by default, since there's no reasonable
// default Myanmar translation to ship. lib/localizeContent.js falls back to
// the English field whenever the Myanmar one is empty. Fields with no "My"
// counterpart (names, images, the email address) aren't language-dependent.
export const defaultContent = {
  heroName: 'Oke',
  heroBody: `work at the *intersection* of brand, content, digital experiences, and business growth. I help turn *ideas* into *brands*, brands into systems, and systems into businesses that can grow.

I turn standard businesses into powerful brands. By aligning brand strategy with advanced digital marketing, custom website/app development, and automated digital solutions, I build the system for your market expansion.`,
  heroBodyMy: '',
  heroBadgePrefix: "It's",
  heroBadgePrefixMy: '',
  heroBadgeEmphasis: 'Heart Work!',
  heroBadgeEmphasisMy: '',
  heroImageFallback: heroOke,

  marketingLine1: 'Not Just',
  marketingLine1My: '',
  marketingLine2: 'Marketing',
  marketingLine2My: '',
  marketingBody: `I'm interested in the whole *system behind growth*. The *brand people remember*. The *message that makes them care*. The *content that earns attention*. The *digital experience that moves them forward*. And *the business thinking that connects everything together.*

That's why my work usually sits somewhere between *strategy, marketing, content, product, and execution.*`,
  marketingBodyMy: '',

  services: [
    {
      title: 'Brand and Positioning',
      titleMy: '',
      copy: 'Finding the clearest answer to why should people choose this brand? I work on positioning, messaging, audience understanding, offers, brand direction, and how the brand should show up in the market.',
      copyMy: '',
      imageFallback: brandPositioning,
    },
    {
      title: 'Growth and Digital Marketing',
      titleMy: '',
      copy: 'Marketing should solve a business problem not simply keep a social media page active. I build strategies around awareness, acquisition, conversion, customer journeys, and growth opportunities.',
      copyMy: '',
      imageFallback: growthMarketing,
    },
    {
      title: 'Content Systems',
      titleMy: '',
      copy: 'I don’t think of content as individual posts. I think about the system behind them. From founder-led content to campaign calendars and repeatable content frameworks, I build content around business objectives.',
      copyMy: '',
      imageFallback: contentSystems,
    },
    {
      title: 'Digital Experiences',
      titleMy: '',
      copy: 'Sometimes the problem isn’t the campaign. It’s what happens after someone clicks. I work on websites, landing experiences, information architecture, digital journeys, and ideas that turn attention into action.',
      copyMy: '',
      imageFallback: digitalExperiences,
    },
  ],

  strategyLine1: 'Strategy',
  strategyLine1My: '',
  strategyLine2: 'Before Tactics.',
  strategyLine2My: '',
  strategyParagraph: 'A new campaign, content format, platform, or tool is rarely the first answer.',
  strategyParagraphMy: '',
  strategyQuote: 'Understanding the problem is.',
  strategyQuoteMy: '',

  buildingLine1: 'Thing',
  buildingLine1My: '',
  buildingLine2: "I'm Building",
  buildingLine2My: '',
  buildingIntro: "I don't only work on brands.",
  buildingIntroMy: '',
  buildingEmphasis: 'I like building things too.',
  buildingEmphasisMy: '',
  projects: [
    {
      name: 'Dubai Directory',
      location: 'Myanmar community in Dubai',
      locationMy: '',
      description:
        'Bringing useful businesses, services, information, and local discoveries into one community-driven ecosystem.',
      descriptionMy: '',
      role: 'Founder / Brand / Product / Growth',
      roleMy: '',
      logoFallback: dubaiLogo,
    },
    {
      name: 'Thailand Directory',
      location: 'Myanmar community in Thailand',
      locationMy: '',
      description:
        'Bringing useful businesses, services, information, and local discoveries into one community-driven ecosystem.',
      descriptionMy: '',
      role: 'Founder / Brand / Product / Growth',
      roleMy: '',
      logoFallback: thailandLogo,
    },
  ],

  workshopImageFallback: workshopImg,
  workshopLine1: 'Strategic Workshop',
  workshopLine1My: '',
  workshopLine2: 'For Myanmar SME Owners',
  workshopLine2My: '',
  workshopBody: `From doing marketing to thinking strategically about growth.

A practical workshop for Myanmar SME owners built around my **LGS — Launch · Grow · Scale Framework**, connecting business fundamentals, customer understanding, branding, marketing, and growth into one structured journey.`,
  workshopBodyMy: '',
  workshopRole: 'Framework Creator / Strategist / Workshop Instructor',
  workshopRoleMy: '',

  // A popup shown once per visit on the homepage, promoting the workshop —
  // separate copy from the Workshop section above since it needs to be much
  // shorter (it's a popup, not a full section) and the admin may want to
  // run it as a time-limited nudge without touching the section itself.
  promoEnabled: true,
  promoHeading: 'Strategic Workshop',
  promoHeadingMy: '',
  promoBody: 'A practical workshop for Myanmar SME owners — from doing marketing to thinking strategically about growth.',
  promoBodyMy: '',
  promoCta: 'View Course Details',
  promoCtaMy: '',

  aboutLine1: 'About me',
  aboutLine1My: '',
  aboutLine2: 'You Need To Know',
  aboutLine2My: '',
  aboutBody: `I like figuring out why things work. My work started around marketing and digital execution, but over time I became more interested in the questions behind the execution.

*Why do people choose one brand over another?*

*Why does one message spread while another gets ignored?*

Those questions pulled me deeper into strategy, branding, content, digital products, and business growth. Today, I work at the intersection of brand, content, digital experiences, and business growth.

The goal is to **"Understand the problem. Build the right system. Make it work"**`,
  aboutBodyMy: '',

  contactLine1: "Let's Build",
  contactLine1My: '',
  contactLine2: 'Something Useful',
  contactLine2My: '',
  contactBody: `**Have a business problem, project, collaboration, or idea worth exploring?** I'd like to hear about it.`,
  contactBodyMy: '',
  contactCta: "Let's Start a Conversation",
  contactCtaMy: '',
  contactEmail: 'hello@okesoekhant.com',
  contactCopyright: '© Oke Soe Khant',
  contactCopyrightMy: '',
  contactTagline: 'Strategy / Brands / Marketing / Building',
  contactTaglineMy: '',
}
