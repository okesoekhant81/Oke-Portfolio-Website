import AdminNav from '../../../components/admin/AdminNav'
import DeleteButton from '../../../components/admin/DeleteButton'
import InquiryStatusSelect from '../../../components/admin/InquiryStatusSelect'
import { getInquiries } from '../../../lib/content/inquiries'
import { deleteInquiryAction } from '../../actions/inquiries'

export const dynamic = 'force-dynamic'

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] tracking-wide text-neutral-400 uppercase">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
    </div>
  )
}

export default async function InquiriesAdminPage() {
  const inquiries = await getInquiries()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/inquiries" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Workshop inquiries</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Registrations submitted from the <code className="rounded bg-neutral-200 px-1">/workshop</code> page.
        </p>

        {inquiries.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">
            No inquiries yet — this fills in as people register on the workshop page.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-bold text-ink">{inquiry.name}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(inquiry.submittedAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <DetailRow label="Email" value={inquiry.email} />
                  <DetailRow label="Phone" value={inquiry.phone} />
                  <DetailRow label="Business" value={inquiry.business} />
                  <DetailRow label="Role" value={inquiry.role} />
                  <DetailRow label="Participants" value={inquiry.participants} />
                </div>

                {inquiry.message && (
                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <p className="text-[10px] tracking-wide text-neutral-400 uppercase">Message</p>
                    <p className="mt-0.5 text-sm whitespace-pre-line text-ink">{inquiry.message}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-end border-t border-neutral-100 pt-3">
                  <form action={deleteInquiryAction}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <DeleteButton confirmText={`Delete the inquiry from "${inquiry.name}"? This can't be undone.`} />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
