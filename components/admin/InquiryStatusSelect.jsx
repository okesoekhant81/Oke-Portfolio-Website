'use client'

import { updateInquiryStatusAction } from '../../app/actions/inquiries'

const STATUS_STYLES = {
  new: 'border-brand/40 bg-brand/10 text-brand',
  contacted: 'border-neutral-300 bg-neutral-100 text-neutral-600',
  enrolled: 'border-green-300 bg-green-50 text-green-700',
}

export default function InquiryStatusSelect({ id, status }) {
  return (
    <form action={updateInquiryStatusAction}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.target.form.requestSubmit()}
        className={`rounded-full border px-3 py-1 text-xs font-medium outline-none ${STATUS_STYLES[status] || STATUS_STYLES.new}`}
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="enrolled">Enrolled</option>
      </select>
    </form>
  )
}
