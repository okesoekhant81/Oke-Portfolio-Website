// "1,234" reads as noise next to a date; compact notation ("1.2K") matches
// the terseness of the rest of the card/date treatment. Always formatted
// in a fixed locale — Myanmar has no "K" abbreviation convention, so
// switching the number format with the site locale would just look odd.
function formatViews(count) {
  if (count < 1000) return String(count)
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(count)
}

// Sized in em so it scales with whatever text-* size the caller already
// set, instead of needing its own size prop threaded through every context
// it's dropped into (article card, blog post header, related-post rail).
export default function ViewCount({ count, className = '' }) {
  if (!count) return null
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-[0.9em] w-[0.9em] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {formatViews(count)}
    </span>
  )
}
