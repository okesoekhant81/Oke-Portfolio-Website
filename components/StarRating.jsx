'use client'

const STAR_PATH = 'M12 2.5l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 18l-6.4 4.2 1.7-7.3L1.7 10l7.4-.6L12 2.5Z'

// Read-only (public display) when onChange is omitted; otherwise an
// interactive 1-5 picker for the admin form. Same star glyph either way
// so a testimonial's public rendering always matches what was picked.
export default function StarRating({ value = 5, onChange, size = 16 }) {
  const readOnly = !onChange

  return (
    <div
      className="flex items-center gap-0.5"
      role={readOnly ? undefined : 'radiogroup'}
      aria-label={readOnly ? `${value} out of 5 stars` : 'Rating'}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={n <= value ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className={n <= value ? 'text-brand' : 'text-neutral-300 dark:text-neutral-700'}
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        )
        if (readOnly) return <span key={n}>{star}</span>
        return (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n === 1 ? '' : 's'}`} className="p-0.5">
            {star}
          </button>
        )
      })}
    </div>
  )
}
