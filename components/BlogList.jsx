'use client'

import { useMemo } from 'react'
import ArticleCard from './ArticleCard'
import { useSearchFilter } from '../lib/useSearchFilter'
import { getDictionary } from '../lib/dictionaries'

// The design repeats a 4-post cluster — one large featured card, two square
// cards side by side, then one wide card — for as many posts as exist.
function chunk(items, size) {
  const groups = []
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size))
  return groups
}

export default function BlogList({ posts, locale = 'en' }) {
  const dict = getDictionary(locale)
  const { query, setQuery, activeFilters, setFilter, filtered } = useSearchFilter(posts, {
    searchKeys: ['title', 'excerpt'],
  })

  const allTags = useMemo(() => {
    const set = new Set()
    posts.forEach((post) => (post.tags || []).forEach((t) => set.add(t)))
    return [...set].sort()
  }, [posts])

  const groups = chunk(filtered, 4)
  const inputClass =
    'w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-ink outline-none transition-colors duration-300 focus:border-brand sm:w-64 dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100'

  return (
    <>
      {(posts.length > 0 && (allTags.length > 0 || posts.length > 4)) && (
        <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.blog.searchPlaceholder}
            className={inputClass}
          />
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('tags', '')}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors duration-300 ${
                  !activeFilters.tags
                    ? 'border-brand bg-brand text-white'
                    : 'border-neutral-300 text-muted hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400'
                }`}
              >
                {dict.blog.allArticles}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFilter('tags', activeFilters.tags === tag ? '' : tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors duration-300 ${
                    activeFilters.tags === tag
                      ? 'border-brand bg-brand text-white'
                      : 'border-neutral-300 text-muted hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm leading-relaxed text-muted sm:text-base dark:text-neutral-400">
          No articles match your search.
        </p>
      ) : (
        <div className="mt-10 space-y-4 sm:mt-14 lg:space-y-6">
          {groups.map((group, i) => {
            const [featured, squareA, squareB, wide] = group
            return (
              <div key={i} className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                {featured && (
                  <ArticleCard post={featured} variant="featured" locale={locale} className="col-span-2 lg:row-span-2" />
                )}
                {squareA && (
                  <ArticleCard
                    post={squareA}
                    variant="square"
                    locale={locale}
                    delay={0.05}
                    className="lg:col-start-3 lg:row-start-1"
                  />
                )}
                {squareB && (
                  <ArticleCard
                    post={squareB}
                    variant="square"
                    locale={locale}
                    delay={0.1}
                    className="lg:col-start-3 lg:row-start-2"
                  />
                )}
                {wide && (
                  <ArticleCard post={wide} variant="wide" locale={locale} delay={0.05} className="col-span-2 lg:col-span-3" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
