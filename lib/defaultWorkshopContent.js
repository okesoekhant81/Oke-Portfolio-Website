import workshopImg from '../assets/img/workshop.jpg'

// Same bilingual convention as lib/defaultContent.js: every translatable
// field has an empty "*My" counterpart, left for the admin to fill in via
// /admin/workshop. `lessons` is one lesson per line (parsed on render) —
// a textarea instead of one field pair per lesson, since a single module
// can hold six or seven of them and a dedicated field per lesson would
// make the admin form unworkably long.
export const defaultWorkshopContent = {
  heroImageFallback: workshopImg,
  heroTitle: 'Strategic Workshop',
  heroTitleMy: '',
  heroSubtitle: 'For Myanmar SME Owners',
  heroSubtitleMy: '',
  intro: `From doing marketing to thinking strategically about growth.

A practical workshop for Myanmar SME owners built around the **LGS — Launch · Grow · Scale Framework**, connecting business fundamentals, customer understanding, branding, marketing, and growth into one structured journey.`,
  introMy: '',

  formatLabel: 'Format',
  formatLabelMy: '',
  format: 'In-person workshop',
  formatMy: '',
  durationLabel: 'Duration',
  durationLabelMy: '',
  duration: 'Contact for the next available date',
  durationMy: '',
  audienceLabel: "Who it's for",
  audienceLabelMy: '',
  audience: 'Myanmar SME owners and founders',
  audienceMy: '',

  priceLabel: 'Investment',
  priceLabelMy: '',
  price: 'Contact for pricing',
  priceMy: '',
  // Empty means no promo running — the page just shows `price` on its own.
  // Set this to show it struck through next to a highlighted promo price.
  promoPrice: '',
  promoPriceMy: '',

  outlineHeading: 'Course Outline',
  outlineHeadingMy: '',
  modules: [
    {
      title: 'Module 1: Lay the Foundation',
      titleMy: '',
      lessons: `The Problem Statement — Defining the Core Challenge
Defining Your Beachhead Market — Strategic Niche Identification
Creating a Proto-Persona — Sketching Your Ideal Customer
Designing a Validation Plan — Testing Hypotheses with Real Customers
The Value Proposition — Articulating Unique Benefit
Scoping Your Minimum Viable Product (MVP) — Core Solution Development
The Build-Measure-Learn Loop — Iteration for Sustainable Growth`,
      lessonsMy: '',
    },
    {
      title: 'Module 2: Foundations of Branding for Entrepreneurs',
      titleMy: '',
      lessons: `Defining Your Brand Purpose (Your "Why") — Inspiring Action
Identifying Your Brand Values — Guiding Principles
Describing Your Brand Personality — Making Your Brand Relatable
Crafting a Brand Positioning Statement — Articulating Your Unique Place
Developing Your Brand Voice — The Sound of Your Brand
Building a Basic Visual Identity — Making Your Brand Recognizable`,
      lessonsMy: '',
    },
    {
      title: 'Module 3: Strategic Marketing for Startups',
      titleMy: '',
      lessons: `Setting SMART Marketing Goals — Turning Ambition into Action
Selecting Your Primary Marketing Channels — Reaching Your Audience Effectively
Mapping the Awareness Stage — Problem Recognition and Information Seeking
Mapping the Consideration Stage — Researching and Comparing Solutions
Mapping the Decision Stage — Final Nudge to Conversion
Adapting for Your Business Model (B2B vs. B2C) — Tailoring Your Message`,
      lessonsMy: '',
    },
    {
      title: 'Module 4: Mastering Digital Marketing Channels',
      titleMy: '',
      lessons: `Planning a Piece of Pillar Content — Building Foundational Expertise
Foundational On-Page SEO — Optimizing for Search Visibility
Social Media Content Planning — Engaging Your Audience Consistently
Designing a Welcome Email — Nurturing New Leads
Understanding Owned, Earned, and Paid Media — A Synergistic Approach
Identifying Your North Star Metric — Guiding Long-Term Growth`,
      lessonsMy: '',
    },
  ],

  ctaHeading: 'Reserve Your Seat',
  ctaHeadingMy: '',
  ctaBody: "Fill out the form below and we'll reach out with the next available schedule.",
  ctaBodyMy: '',

  faqHeading: 'Frequently Asked Questions',
  faqHeadingMy: '',
  // Fixed 6 slots, same convention as `modules` above — a blank question
  // is simply skipped on the public page (see FAQAccordion), so the admin
  // doesn't have to fill in all six.
  faqs: [
    {
      question: 'Do I need any prior marketing experience?',
      questionMy: '',
      answer: 'No — the workshop starts from the fundamentals and builds up, so it works whether marketing is new to you or already part of your job.',
      answerMy: '',
    },
    {
      question: 'What happens if I miss a session?',
      questionMy: '',
      answer: 'Reach out and we’ll help you catch up before the next session — attendance is tracked, but a single missed day won’t remove you from the cohort.',
      answerMy: '',
    },
    { question: '', questionMy: '', answer: '', answerMy: '' },
    { question: '', questionMy: '', answer: '', answerMy: '' },
    { question: '', questionMy: '', answer: '', answerMy: '' },
    { question: '', questionMy: '', answer: '', answerMy: '' },
  ],
}
