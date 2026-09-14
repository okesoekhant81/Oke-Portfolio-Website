'use client'

import { useMemo, useState } from 'react'

// Plain case-insensitive substring match across the given fields, plus
// exact-match dropdown filters — shared by every admin list (Inquiries,
// Students, Posts) instead of each page reimplementing its own filtering.
// Client-side only, since these lists are fully loaded already; a real
// search index would be overkill at this scale.
export function useSearchFilter(items, { searchKeys = [] } = {}) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (q && !searchKeys.some((key) => String(item[key] || '').toLowerCase().includes(q))) return false
      return Object.entries(activeFilters).every(([key, value]) => !value || item[key] === value)
    })
  }, [items, query, activeFilters, searchKeys])

  function setFilter(key, value) {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
  }

  return { query, setQuery, activeFilters, setFilter, filtered }
}

export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand sm:w-56"
    />
  )
}

export function FilterSelect({ value, onChange, options, placeholder = 'All' }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
