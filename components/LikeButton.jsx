'use client'

import { useEffect, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { setPostLikedAction } from '../app/actions/likes'
import { getDictionary } from '../lib/dictionaries'

// No accounts on this site, so "liked" is remembered per-browser rather
// than per-person — same anonymous, best-effort spirit as the view counter.
function storageKey(slug) {
  return `liked:${slug}`
}

export default function LikeButton({ slug, initialCount, locale = 'en' }) {
  const dict = getDictionary(locale)
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [, startTransition] = useTransition()

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(storageKey(slug)) === '1')
    } catch {
      // Private browsing etc. — like just won't persist across visits.
    }
  }, [slug])

  function toggle() {
    const next = !liked
    setLiked(next)
    setCount((c) => c + (next ? 1 : -1))
    try {
      localStorage.setItem(storageKey(slug), next ? '1' : '0')
    } catch {
      // Fine — the count still updates server-side for this session.
    }
    startTransition(() => {
      setPostLikedAction(slug, next)
    })
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      aria-pressed={liked}
      aria-label={liked ? dict.blog.unlikeAria : dict.blog.likeAria}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
        liked
          ? 'border-brand text-brand'
          : 'border-neutral-200 text-ink hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-100'
      }`}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        animate={liked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <path d="M12 20.5s-7.5-4.6-9.8-9.2C.6 7.9 2.3 4.5 5.8 4 8 3.7 10 4.8 12 7c2-2.2 4-3.3 6.2-3 3.5.5 5.2 3.9 3.6 7.3C19.5 15.9 12 20.5 12 20.5Z" />
      </motion.svg>
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </motion.button>
  )
}
