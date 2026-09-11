import Link from 'next/link'
import Reveal from './Reveal'
import { getDictionary, italicIfLatin } from '../lib/dictionaries'

function formatDate(dateString, dateLocale) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const VARIANT_CLASSES = {
  // Keeping this square (not deriving height from the row-span-2 grid area)
  // is deliberate: with 3 equal columns and a shared gap, a square card
  // spanning 2 columns is exactly as tall as 2 stacked square cards in the
  // 3rd column, so it lines up without depending on those cards existing —
  // a lone featured card (no square siblings after it) would otherwise
  // collapse to zero height, since its own children are all absolutely
  // positioned and contribute no intrinsic size.
  featured: 'aspect-square',
  square: 'aspect-square',
  wide: 'aspect-[345/150] lg:aspect-[3/1]',
}

// Image-backed card used for both the blog list grid and the "Articles you
// may like" rail. `featured` adds an excerpt beneath the title; `square`
// and `wide` only differ in aspect ratio. `className` lets callers add grid
// placement utilities (col-span, row-start, etc.) for desktop layouts.
export default function ArticleCard({ post, variant = 'square', delay = 0, className = '', locale = 'en' }) {
  const dict = getDictionary(locale)
  const date = formatDate(post.publishedAt, dict.locale.dateLocale)

  return (
    <Reveal
      delay={delay}
      className={`relative overflow-hidden rounded-[10px] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <Link href={`/blog/${post.slug}`} className="group block size-full">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-ink/90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
          {date && <p className={`font-display text-[10px] text-white/70 lg:text-xs ${italicIfLatin(locale)}`}>{date}</p>}
          <h3
            className={
              variant === 'featured'
                ? `mt-1 font-display text-sm font-bold text-white lg:text-xl ${italicIfLatin(locale)}`
                : `mt-1 font-display text-xs font-bold text-white line-clamp-3 lg:text-base ${italicIfLatin(locale)}`
            }
          >
            {post.title}
          </h3>
          {variant === 'featured' && post.excerpt && (
            <p className="mt-2 text-[11px] leading-relaxed text-white/80 line-clamp-3 lg:text-sm">{post.excerpt}</p>
          )}
        </div>
      </Link>
    </Reveal>
  )
}
