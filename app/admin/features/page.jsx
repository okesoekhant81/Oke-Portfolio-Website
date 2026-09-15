import AdminNav from '../../../components/admin/AdminNav'
import { FEATURE_CATEGORIES } from '../../../lib/featuresList'

const STATUS_STYLES = {
  live: 'border-green-300 bg-green-50 text-green-700',
  new: 'border-brand/40 bg-brand/10 text-brand',
}

const STATUS_LABELS = { live: 'Live', new: 'New' }

function StatusBadge({ status }) {
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status] || STATUS_STYLES.live}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default function FeaturesAdminPage() {
  const totalFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.length, 0)
  const newCount = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.filter((f) => f.status === 'new').length, 0)

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/features" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold italic text-brand">Features</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Everything currently shipped on the site — {totalFeatures} features across {FEATURE_CATEGORIES.length}{' '}
          areas. {newCount} marked <StatusBadge status="new" /> haven&rsquo;t seen real production traffic yet —
          worth checking those first. This list is maintained by hand, not generated from the code, so it can drift;
          if something here doesn&rsquo;t match what you actually see on the site, that&rsquo;s the list being wrong,
          not the site.
        </p>

        <div className="mt-8 space-y-8">
          {FEATURE_CATEGORIES.map((category) => (
            <div key={category.title}>
              <div className="flex items-baseline justify-between gap-3 border-b border-neutral-200 pb-2">
                <h2 className="font-display text-lg font-bold italic text-ink">{category.title}</h2>
                <span className="shrink-0 text-xs text-neutral-400">{category.features.length}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">{category.description}</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {category.features.map((feature) => (
                  <div key={feature.name} className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{feature.name}</p>
                      <StatusBadge status={feature.status} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
