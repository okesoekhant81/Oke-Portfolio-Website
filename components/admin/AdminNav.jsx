import Link from 'next/link'
import { logout } from '../../app/actions/auth'

export default function AdminNav({ active }) {
  const items = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/homepage', label: 'Homepage' },
    { href: '/admin/workshop', label: 'Workshop' },
    { href: '/admin/posts', label: 'Articles' },
    { href: '/admin/inquiries', label: 'Inquiries' },
    { href: '/admin/students', label: 'Students' },
  ]

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-sm ${active === item.href ? 'font-semibold text-brand' : 'text-neutral-600 hover:text-ink'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" target="_blank" className="whitespace-nowrap text-xs text-neutral-400 hover:text-neutral-600">
            View site ↗
          </Link>
          <form action={logout}>
            <button type="submit" className="whitespace-nowrap text-xs text-neutral-400 hover:text-neutral-600">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
