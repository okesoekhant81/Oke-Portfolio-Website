'use client'

import { useActionState, useState } from 'react'
import { savePostAction } from '../../app/actions/posts'
import ImageField from './ImageField'

function toDateInputValue(iso) {
  if (!iso) return new Date().toISOString().slice(0, 10)
  return new Date(iso).toISOString().slice(0, 10)
}

function LanguageTabs({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[
        { key: 'en', label: 'English' },
        { key: 'my', label: 'မြန်မာ' },
      ].map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === tab.key ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
      <p className="ml-auto self-center text-xs text-neutral-400">
        {value === 'en' ? 'Editing English' : 'Editing Myanmar — blank fields fall back to English on the site'}
      </p>
    </div>
  )
}

export default function PostForm({ post }) {
  const [state, formAction, pending] = useActionState(savePostAction, null)
  const [formLocale, setFormLocale] = useState('en')
  const isEditing = Boolean(post)

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
      {isEditing && <input type="hidden" name="previousSlug" value={post.slug} />}

      <LanguageTabs value={formLocale} onChange={setFormLocale} />

      <div>
        <label className="block text-xs font-medium text-neutral-600">Title</label>
        <input
          name="title"
          defaultValue={post?.title}
          required
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
            formLocale !== 'en' ? 'hidden' : ''
          }`}
        />
        <input
          name="titleMy"
          defaultValue={post?.titleMy}
          placeholder="မြန်မာလို ခေါင်းစဉ်..."
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
            formLocale !== 'my' ? 'hidden' : ''
          }`}
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
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
            formLocale !== 'en' ? 'hidden' : ''
          }`}
        />
        <textarea
          name="excerptMy"
          defaultValue={post?.excerptMy}
          rows={2}
          placeholder="မြန်မာလို အကျဉ်းချုပ်..."
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand ${
            formLocale !== 'my' ? 'hidden' : ''
          }`}
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
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand ${
            formLocale !== 'en' ? 'hidden' : ''
          }`}
        />
        <textarea
          name="bodyMy"
          defaultValue={post?.bodyMy}
          rows={16}
          placeholder="မြန်မာလို ဆောင်းပါးအကြောင်းအရာ..."
          className={`mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand ${
            formLocale !== 'my' ? 'hidden' : ''
          }`}
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
