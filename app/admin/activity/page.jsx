import AdminNav from '../../../components/admin/AdminNav'
import { getActivityLog } from '../../../lib/activityLog'

export const dynamic = 'force-dynamic'

export default async function ActivityAdminPage() {
  const log = await getActivityLog()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/activity" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Activity</h1>
        <p className="mt-1 text-sm text-neutral-500">
          What changed and when — newest first, last {log.length} entries. There&rsquo;s one shared admin login, so
          this records actions, not who took them.
        </p>

        {log.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">No activity recorded yet.</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <ul className="divide-y divide-neutral-100">
              {log.map((entry, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{entry.action}</p>
                    {entry.detail && <p className="truncate text-xs text-neutral-400">{entry.detail}</p>}
                  </div>
                  <p className="shrink-0 text-xs text-neutral-400">
                    {new Date(entry.at).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
