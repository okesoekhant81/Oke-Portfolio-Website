'use client'

export { useSearchFilter } from '../../lib/useSearchFilter'

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
