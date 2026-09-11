import Link from 'next/link'
import Reveal from './Reveal'

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const VARIANT_CLASSES = {
  featured: 'aspect-square',
  square: 'aspect-square',
  wide: 'aspect-[345/150]',
}

// Image-backed card used for both the blog list grid and the "Articles you
// may like" rail. `featured` adds an excerpt beneath the title; `square`
// and `wide` only differ in aspect ratio.
export default function ArticleCard({ post, variant = 'square', delay = 0 }) {
  const date = formatDate(post.publishedAt)

  return (
    <Reveal delay={delay} className={`relative overflow-hidden rounded-[10px] ${VARIANT_CLASSES[variant]}`}>
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
        <div className="absolute inset-x-0 bottom-0 p-4">
          {date && <p className="font-display text-[10px] italic text-white/70">{date}</p>}
          <h3
            className={
              variant === 'featured'
                ? 'mt-1 font-display text-sm font-bold italic text-white'
                : 'mt-1 font-display text-xs font-bold italic text-white line-clamp-3'
            }
          >
            {post.title}
          </h3>
          {variant === 'featured' && post.excerpt && (
            <p className="mt-2 text-[11px] leading-relaxed text-white/80 line-clamp-3">{post.excerpt}</p>
          )}
        </div>
      </Link>
    </Reveal>
  )
}
