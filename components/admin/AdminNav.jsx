import Link from 'next/link'
import { cookies } from 'next/headers'
import { logout } from '../../app/actions/auth'
import { SESSION_COOKIE, getSessionAdminName } from '../../lib/auth'

// Grouped into a handful of dropdowns rather than one flat list — with a
// dozen-plus admin pages now, a flat list wraps across several lines on a
// phone before any page content is even visible. Native <details>, not a
// client component with open/close state: no JS needed, each dropdown's
// content is positioned absolute (see NavGroup) so opening one doesn't
// push the page down, and the shared `name` makes only one open at a
// time in browsers that support it (harmless no-op where it isn't).
const GROUPS = [
  {
    label: 'Content',
    items: [
      { href: '/admin/homepage', label: 'Homepage' },
      { href: '/admin/about', label: 'About' },
      { href: '/admin/workshop', label: 'Workshop' },
      { href: '/admin/posts', label: 'Articles' },
      { href: '/admin/testimonials', label: 'Testimonials' },
    ],
  },
  {
    label: 'Workshop',
    items: [
      { href: '/admin/classes', label: 'Classes' },
      { href: '/admin/students', label: 'Students' },
      { href: '/admin/inquiries', label: 'Inquiries' },
    ],
  },
  {
    label: 'Site',
    items: [
      { href: '/admin/subscribers', label: 'Subscribers' },
      { href: '/admin/backup', label: 'Backup' },
      { href: '/admin/activity', label: 'Activity' },
      { href: '/admin/trash', label: 'Trash' },
      { href: '/admin/team', label: 'Team' },
      { href: '/admin/features', label: 'Features' },
    ],
  },
]

function NavLink({ item, active }) {
  return (
    <Link
      href={item.href}
      className={`whitespace-nowrap text-sm ${active === item.href ? 'font-semibold text-brand' : 'text-neutral-600 hover:text-ink'}`}
    >
      {item.label}
    </Link>
  )
}

function NavGroup({ group, active }) {
  const isActive = group.items.some((item) => item.href === active)

  return (
    <details name="admin-nav-group" className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center gap-1 whitespace-nowrap text-sm [&::-webkit-details-marker]:hidden ${
          isActive ? 'font-semibold text-brand' : 'text-neutral-600 hover:text-ink'
        }`}
      >
        {group.label}
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3 shrink-0 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="absolute left-0 top-full z-20 mt-2 min-w-36 rounded-lg border border-neutral-200 bg-white py-1.5 shadow-lg">
        {group.items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-1.5 text-sm whitespace-nowrap ${
              item.href === active ? 'font-semibold text-brand' : 'text-neutral-600 hover:bg-neutral-50 hover:text-ink'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  )
}

export default async function AdminNav({ active }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const adminName = await getSessionAdminName(token)

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">
          <NavLink item={{ href: '/admin', label: 'Dashboard' }} active={active} />
          {GROUPS.map((group) => (
            <NavGroup key={group.label} group={group} active={active} />
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          {adminName && <span className="whitespace-nowrap text-xs text-neutral-400">Signed in as {adminName}</span>}
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
