import Link from 'next/link'
import ArticleCard from './ArticleCard'
import Reveal from './Reveal'

// Mirrors the single 4-post cluster used on /blog (1 featured + 2 square +
// 1 wide) so the homepage preview reads as the same design system, not a
// one-off layout.
export default function LatestArticles({ posts }) {
  if (posts.length === 0) return null
  const [featured, squareA, squareB, wide] = posts

  return (
    <section className="bg-white px-6 py-12 sm:px-12 sm:py-16 md:px-16">
      <div className="mx-auto max-w-4xl">
        <Reveal className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold italic text-brand sm:text-4xl">Latest Articles</h2>
          <Link
            href="/blog"
            className="shrink-0 text-xs text-brand underline decoration-brand/40 underline-offset-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-ink hover:decoration-ink/50 sm:text-sm"
          >
            View all
          </Link>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 lg:grid-cols-3 lg:gap-6">
          {featured && <ArticleCard post={featured} variant="featured" className="col-span-2 lg:row-span-2" />}
          {squareA && (
            <ArticleCard post={squareA} variant="square" delay={0.05} className="lg:col-start-3 lg:row-start-1" />
          )}
          {squareB && (
            <ArticleCard post={squareB} variant="square" delay={0.1} className="lg:col-start-3 lg:row-start-2" />
          )}
          {wide && <ArticleCard post={wide} variant="wide" delay={0.05} className="col-span-2 lg:col-span-3" />}
        </div>
      </div>
    </section>
  )
}
