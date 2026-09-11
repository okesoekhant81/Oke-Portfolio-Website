'use client'

import { useActionState } from 'react'
import { savePostAction } from '../../app/actions/posts'
import ImageField from './ImageField'

function toDateInputValue(iso) {
  if (!iso) return new Date().toISOString().slice(0, 10)
  return new Date(iso).toISOString().slice(0, 10)
}

export default function PostForm({ post }) {
  const [state, formAction, pending] = useActionState(savePostAction, null)
  const isEditing = Boolean(post)

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
      {isEditing && <input type="hidden" name="previousSlug" value={post.slug} />}

      <div>
        <label className="block text-xs font-medium text-neutral-600">Title</label>
        <input
          name="title"
          defaultValue={post?.title}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600">
          Slug <span className="font-normal text-neutral-400">(leave blank to auto-generate from title)</span>
        </label>
        <input
          name="slug"
          defaultValue={post?.slug}
          placeholder="my-article-title"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600">Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt}
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600">Published date</label>
        <input
          type="date"
          name="publishedAt"
          defaultValue={toDateInputValue(post?.publishedAt)}
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <ImageField label="Cover image" name="coverImageUrl" defaultValue={post?.coverImageUrl} />

      <div>
        <label className="block text-xs font-medium text-neutral-600">
          Body{' '}
          <span className="font-normal text-neutral-400">
            (*emphasis*, **bold**, blank line = new paragraph)
          </span>
        </label>
        <textarea
          name="body"
          defaultValue={post?.body}
          rows={16}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {pending ? 'Saving…' : isEditing ? 'Save changes' : 'Publish article'}
      </button>
    </form>
  )
}
