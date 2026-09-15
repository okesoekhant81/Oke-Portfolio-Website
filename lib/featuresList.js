// A hand-maintained inventory of what's shipped on the site, for
// /admin/features — not generated from the codebase, so it only stays
// accurate if it's updated alongside whatever actually changes. status:
// 'new' marks anything shipped in the certificate/verification build-out
// (and the admin-list live-update work alongside it) that hasn't seen real
// production traffic yet; everything else is 'live' — in the codebase,
// pushed, and already exercised by real registrations/admin use.
export const FEATURE_CATEGORIES = [
  {
    title: 'Public site',
    description: 'What a visitor sees before they ever register for anything.',
    features: [
      { name: 'Bilingual site', description: 'Every page renders in English or Myanmar via a locale toggle, cookie-remembered across visits.', status: 'live' },
      { name: 'Dark mode', description: 'Theme toggle with no flash-of-wrong-theme on load.', status: 'live' },
      { name: 'Homepage', description: 'Hero, services, strategy philosophy, project showcase, workshop teaser, testimonials, about, latest articles, contact.', status: 'live' },
      { name: 'About page', description: 'Stats, experience timeline, and skills, all admin-editable.', status: 'live' },
      { name: 'Blog / Articles', description: 'Search, tag filtering, tag-based related posts, RSS feed, view counts, likes, and share.', status: 'live' },
      { name: 'Privacy policy', description: 'Standalone page linked from the cookie banner.', status: 'live' },
      { name: 'Cookie consent', description: 'Accept/decline banner that actually gates Google Analytics — decline means it never loads.', status: 'live' },
      { name: 'WhatsApp button', description: 'One-tap contact channel, kept separate from the footer’s profile links.', status: 'live' },
      { name: 'Newsletter signup', description: 'Email capture with duplicate protection.', status: 'live' },
    ],
  },
  {
    title: 'Workshop registration',
    description: 'The path from "I’m interested" to "I have a confirmed seat."',
    features: [
      { name: 'Course page', description: 'Outline as an accordion, FAQ, pricing with optional promo strike-through.', status: 'live' },
      { name: 'Live cohort status', description: 'Shows the active cohort’s headcount, or falls back to the most recently completed one, or the next upcoming date.', status: 'new' },
      { name: 'Multi-step registration form', description: 'One field per step on mobile, with a honeypot, fill-time check, and per-IP rate limit against bots.', status: 'live' },
      { name: 'Capacity & waitlist', description: 'A class fills up automatically; new registrations past capacity become waitlist entries instead of confirmed seats.', status: 'live' },
      { name: 'Payment step', description: 'Multiple payment methods with QR codes, copy-to-clipboard account details, and screenshot upload as proof.', status: 'live' },
      { name: 'Public testimonials', description: 'Visitors can submit their own; nothing appears live until an admin approves it.', status: 'live' },
    ],
  },
  {
    title: 'Certificates & verification',
    description: 'What a student gets once their cohort is marked complete.',
    features: [
      { name: 'Certificate of completion', description: 'Custom logo and signature image, real completion date — not a blank line to hand-sign.', status: 'new' },
      { name: 'Scannable QR code', description: 'Printed on the certificate itself, pointing straight at the public verification page.', status: 'new' },
      { name: 'Public verification page', description: 'Anyone with the link sees the real certificate plus a checklist of the course outline completed.', status: 'new' },
      { name: 'Certificate-ready email', description: 'Fires automatically the moment a class flips to "Completed" — no admin has to remember to send it.', status: 'new' },
      { name: 'Social share', description: 'One-click share to Facebook, plus a generic share/copy-link fallback.', status: 'new' },
      { name: 'Share preview', description: 'Open Graph tags show the student’s name and course when the link is shared, not a generic homepage card.', status: 'new' },
    ],
  },
  {
    title: 'Admin — content & operations',
    description: 'Running the business day to day.',
    features: [
      { name: 'Content editors', description: 'Homepage, About, and Workshop — every section, image, and email template, bilingual.', status: 'live' },
      { name: 'Blog editor', description: 'Draft and scheduled posts, with a media library picker for images.', status: 'live' },
      { name: 'Testimonials manager', description: 'Add, edit, approve, reorder, and delete — with a queue for public submissions.', status: 'live' },
      { name: 'Classes manager', description: 'Date, label, time, fee, capacity, meeting link, and status, in a collapsible list.', status: 'live' },
      { name: 'Students manager', description: 'Profile edits, class reassignment, payment status, attendance (with mark-all), search, and CSV export.', status: 'live' },
      { name: 'Inquiries manager', description: 'Convert to student, bulk status changes, bulk delete, search, and CSV export.', status: 'live' },
      { name: 'Live updates', description: 'Inquiries and Students detect new registrations on their own — no manual reload to see them.', status: 'new' },
      { name: 'Subscribers & Team', description: 'Manage the newsletter list and who else can sign in as an admin.', status: 'live' },
      { name: 'Confirm dialogs', description: 'A real in-app dialog for every delete, not the browser’s own unstyled popup.', status: 'new' },
    ],
  },
  {
    title: 'Admin — data & trust tools',
    description: 'Keeping the record straight.',
    features: [
      { name: 'Trash', description: 'Soft-deleted students, posts, and testimonials are recoverable until permanently cleared.', status: 'live' },
      { name: 'Activity log', description: 'An audit trail of what changed in admin, and when.', status: 'live' },
      { name: 'Full backup', description: 'One-click export of everything the site holds.', status: 'live' },
      { name: 'Analytics dashboard', description: 'Revenue by class, inquiry source breakdown, conversion rate, post views and likes — printable.', status: 'live' },
    ],
  },
  {
    title: 'Security & privacy',
    description: 'The part visitors never see, and shouldn’t have to think about.',
    features: [
      { name: 'Signed sessions', description: 'Admin login uses a timing-safe, HMAC-signed cookie — no plain shared secret sitting in the code.', status: 'live' },
      { name: 'PII isolated on Postgres', description: 'Students, inquiries, and admin accounts live in a database with row-level security, separate from general content.', status: 'live' },
      { name: 'Non-guessable storage paths', description: 'Content files sit behind a secret prefix instead of a predictable public path.', status: 'live' },
      { name: 'No leaked internals', description: 'Public forms only ever show a written, generic error — never a raw database message.', status: 'live' },
      { name: 'Bot & abuse defenses', description: 'Rate limiting and honeypots on every public submission form.', status: 'live' },
    ],
  },
  {
    title: 'Marketing, SEO & email',
    description: 'How the site gets found, and how it follows up.',
    features: [
      { name: 'Meta Pixel + Conversions API', description: 'PageView, registration, and admin-verified purchase events, deduped between browser and server.', status: 'new' },
      { name: 'Structured data everywhere', description: 'Person, Organization, Course, FAQ, Article, reviews, and breadcrumbs — on every public page.', status: 'live' },
      { name: 'Sitemap, robots & llms.txt', description: 'Standard search-engine files, plus a plain-language summary for AI answer engines.', status: 'live' },
      { name: 'Google Analytics', description: 'Loads only after cookie consent, never on admin pages.', status: 'live' },
      { name: 'Automated email', description: 'Registration confirmation, certificate-ready, day-before class reminders, and new-inquiry alerts to the admin.', status: 'live' },
      { name: 'Daily reminder cron', description: 'Runs on its own schedule — no one has to remember to send tomorrow’s reminder.', status: 'live' },
    ],
  },
]
