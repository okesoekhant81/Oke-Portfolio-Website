'use client'

import { useState, useTransition } from 'react'
import { restoreStudentAction, permanentlyDeleteStudentAction } from '../../app/actions/students'
import { restorePostAction, permanentlyDeletePostAction } from '../../app/actions/posts'
import { restoreTestimonialAction, permanentlyDeleteTestimonialAction } from '../../app/actions/testimonials'
import { useConfirm } from './ConfirmProvider'

// One row's restore/delete-forever buttons, generalized over which content
// type it belongs to via idField ('id' for students/testimonials, 'slug'
// for posts) and which pair of server actions to call — the three
// TrashSection calls below just supply those.
function TrashSection({ title, items, idField, emptyText, restoreAction, deleteAction, renderItem }) {
  const [busyId, setBusyId] = useState(null)
  const [removed, setRemoved] = useState(() => new Set())
  const [, startTransition] = useTransition()
  const confirm = useConfirm()

  async function run(action, id, confirmText) {
    if (confirmText && !(await confirm(confirmText))) return
    setBusyId(id)
    const formData = new FormData()
    formData.set(idField, id)
    startTransition(async () => {
      try {
        await action(formData)
        setRemoved((prev) => new Set(prev).add(id))
      } finally {
        setBusyId(null)
      }
    })
  }

  const visible = items.filter((item) => !removed.has(item[idField]))

  return (
    <div className="mt-6 border-t border-neutral-100 pt-6 first:mt-0 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold text-neutral-500">
        {title} ({visible.length})
      </p>
      {visible.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">{emptyText}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {visible.map((item) => {
            const id = item[idField]
            const busy = busyId === id
            return (
              <li
                key={id}
                className={`flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 ${busy ? 'opacity-50' : ''}`}
              >
                <div className="min-w-0">{renderItem(item)}</div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(restoreAction, id)}
                    className="text-xs text-brand hover:underline disabled:opacity-60"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(deleteAction, id, "Permanently delete this? This can't be undone.")}
                    className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-60"
                  >
                    Delete forever
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function TrashManager({ students, posts, testimonials }) {
  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6">
      <p className="text-sm text-neutral-500">
        Deleted items are kept here until permanently removed — restore a misclick, or clear one out for good.
      </p>

      <TrashSection
        title="Students"
        items={students}
        idField="id"
        emptyText="No deleted students."
        restoreAction={restoreStudentAction}
        deleteAction={permanentlyDeleteStudentAction}
        renderItem={(s) => (
          <>
            <p className="truncate text-sm font-medium text-ink">{s.name}</p>
            {s.email && <p className="truncate text-xs text-neutral-400">{s.email}</p>}
          </>
        )}
      />

      <TrashSection
        title="Articles"
        items={posts}
        idField="slug"
        emptyText="No deleted articles."
        restoreAction={restorePostAction}
        deleteAction={permanentlyDeletePostAction}
        renderItem={(p) => <p className="truncate text-sm font-medium text-ink">{p.title}</p>}
      />

      <TrashSection
        title="Testimonials"
        items={testimonials}
        idField="id"
        emptyText="No deleted testimonials."
        restoreAction={restoreTestimonialAction}
        deleteAction={permanentlyDeleteTestimonialAction}
        renderItem={(t) => (
          <>
            <p className="truncate text-sm font-medium text-ink">{t.name}</p>
            {t.quote && <p className="truncate text-xs text-neutral-400">{t.quote}</p>}
          </>
        )}
      />
    </div>
  )
}
