'use client'

import { useActionState, useEffect, useState } from 'react'
import { savePostAction } from '../../app/actions/posts'
import { LanguageTabs, LockContext } from './ContentFormFields'
import ImageField from './ImageField'
import SaveBar from './SaveBar'

function toDateInputValue(iso) {
  if (!iso) return new Date().toISOString().slice(0, 10)
  return new Date(iso).toISOString().slice(0, 10)
}

const fieldBase = 'mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-200'
const fieldEditable = 'border-neutral-300 focus:border-brand'
const fieldLocked = 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-default'

export default function PostForm({ post }) {
  const [state, formAction, pending] = useActionState(savePostAction, null)
  const [formLocale, setFormLocale] = useState('en')
  const isEditing = Boolean(post)
  // A new post has nothing to protect from accidental edits — it opens
  // straight into edit mode. Editing an existing one opens read-only, same
  // as the homepage/workshop content forms, and relocks itself after a
  // successful save.
  const [locked, setLocked] = useState(isEditing)
  const [formKey, setFormKey] = useState(0)
  const fieldClass = (extra = '') => `${fieldBase} ${locked ? fieldLocked : fieldEditable} ${extra}`

  useEffect(() => {
    if (state?.success) setLocked(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.savedAt])

  function handleCancel() {
    setFormKey((k) => k + 1)
    setLocked(true)
  }

  return (
    <LockContext.Provider value={locked}>
    <form
      key={formKey}
      action={formAction}
      className="mt-6 space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
    >
      {isEditing && <input type="hidden" name="previousSlug" value={post.slug} />}

      <LanguageTabs value={formLocale} onChange={setFormLocale} />

      <div>
        <label className="block text-xs font-medium text-neutral-600">Title</label>
        <input
          name="title"
          defaultValue={post?.title}
          required
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          className={fieldClass(formLocale !== 'en' ? 'hidden' : '')}
        />
        <input
          name="titleMy"
          defaultValue={post?.titleMy}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          placeholder="မြန်မာလို ခေါင်းစဉ်..."
          className={fieldClass(formLocale !== 'my' ? 'hidden' : '')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600">
          Slug <span className="font-normal text-neutral-400">(leave blank to auto-generate from title)</span>
        </label>
        <input
          name="slug"
          defaultValue={post?.slug}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          placeholder="my-article-title"
          className={fieldClass()}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600">Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt}
          rows={2}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          className={fieldClass(formLocale !== 'en' ? 'hidden' : '')}
        />
        <textarea
          name="excerptMy"
          defaultValue={post?.excerptMy}
          rows={2}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          placeholder="မြန်မာလို အကျဉ်းချုပ်..."
          className={fieldClass(formLocale !== 'my' ? 'hidden' : '')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600">Published date</label>
        <input
          type="date"
          name="publishedAt"
          defaultValue={toDateInputValue(post?.publishedAt)}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          className={fieldClass('sm:w-auto')}
        />
      </div>

      <ImageField label="Cover image" name="coverImageUrl" defaultValue={post?.coverImageUrl} />

      <div>
        <label className="block text-xs font-medium text-neutral-600">
          Tags <span className="font-normal text-neutral-400">(comma-separated, e.g. branding, marketing)</span>
        </label>
        <input
          name="tags"
          defaultValue={(post?.tags || []).join(', ')}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          className={fieldClass()}
        />
      </div>

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
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          className={fieldClass(`font-mono ${formLocale !== 'en' ? 'hidden' : ''}`)}
        />
        <textarea
          name="bodyMy"
          defaultValue={post?.bodyMy}
          rows={16}
          readOnly={locked}
          tabIndex={locked ? -1 : 0}
          placeholder="မြန်မာလို ဆောင်းပါးအကြောင်းအရာ..."
          className={fieldClass(`font-mono ${formLocale !== 'my' ? 'hidden' : ''}`)}
        />
      </div>

      <SaveBar
        locked={locked}
        onEdit={() => setLocked(false)}
        onCancel={handleCancel}
        pending={pending}
        state={state}
        saveLabel={isEditing ? 'Save changes' : 'Publish article'}
      />
    </form>
    </LockContext.Provider>
  )
}
