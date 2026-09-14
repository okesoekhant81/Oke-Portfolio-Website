'use client'

import { useMemo, useState } from 'react'

// Plain case-insensitive substring match across the given fields, plus
// exact-match filters — shared between admin list pages (Inquiries,
// Students, Posts) and the public blog list, each supplying their own UI
// around it, so the filtering logic itself lives in exactly one place.
export function useSearchFilter(items, { searchKeys = [] } = {}) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (q && !searchKeys.some((key) => String(item[key] || '').toLowerCase().includes(q))) return false
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true
        const itemValue = item[key]
        return Array.isArray(itemValue) ? itemValue.includes(value) : itemValue === value
      })
    })
  }, [items, query, activeFilters, searchKeys])

  function setFilter(key, value) {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
  }

  return { query, setQuery, activeFilters, setFilter, filtered }
}
