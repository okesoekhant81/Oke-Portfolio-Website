// Admin is a data-checking tool, not the polished public card — unlike
// ViewCount/LikeCount on the site, a post with zero views or likes still
// shows "0" here rather than hiding the number, since "no data yet" is
// itself the useful answer when someone's specifically checking performance.
function StatCount({ icon, count }) {
  return (
    <span className="inline-flex items-center gap-1">
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {icon === 'eye' ? (
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </>
        ) : (
          <path d="M12 20.5s-7.5-4.6-9.8-9.2C.6 7.9 2.3 4.5 5.8 4 8 3.7 10 4.8 12 7c2-2.2 4-3.3 6.2-3 3.5.5 5.2 3.9 3.6 7.3C19.5 15.9 12 20.5 12 20.5Z" />
        )}
      </svg>
      {count}
    </span>
  )
}

function sumLastNDays(daily, n) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let sum = 0
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    sum += daily[d.toISOString().slice(0, 10)] || 0
  }
  return sum
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

// Sunday-aligned grid covering `weeks` full weeks, the last one padded with
// (unstyled) future days so the column count stays constant regardless of
// which weekday "today" falls on. Also derives one month label per
// week-column (shown on the column where that month first appears) — a
// heatmap with no axis labels at all is unreadable, especially on touch
// devices where the per-cell title tooltip can't be hovered.
function buildHeatmap(daily, weeks) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
  const start = new Date(endOfWeek)
  start.setDate(endOfWeek.getDate() - (weeks * 7 - 1))

  const days = []
  let max = 0
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const isFuture = d > today
    const count = isFuture ? 0 : daily[key] || 0
    if (!isFuture) max = Math.max(max, count)
    days.push({ date: key, count, isFuture })
  }

  let lastMonth = null
  const monthLabels = []
  for (let w = 0; w < weeks; w++) {
    const sunday = days[w * 7]
    const month = sunday.date.slice(0, 7)
    if (month !== lastMonth) {
      lastMonth = month
      monthLabels.push(MONTH_NAMES[Number(sunday.date.slice(5, 7)) - 1])
    } else {
      monthLabels.push(null)
    }
  }

  return { days, max, monthLabels, rangeStart: days[0].date, rangeEnd: days[days.length - 1].date }
}

function formatShortDate(iso) {
  const [, month, day] = iso.split('-')
  return `${MONTH_NAMES[Number(month) - 1]} ${Number(day)}`
}

// Sequential, single-hue: opacity steps of the brand color over the white
// card surface, so "more views" is reliably darker with no hue to misread.
function cellClass(count, max, isFuture) {
  if (isFuture) return 'bg-transparent'
  if (count === 0 || max === 0) return 'bg-neutral-100'
  const ratio = count / max
  if (ratio > 0.8) return 'bg-brand'
  if (ratio > 0.55) return 'bg-brand/75'
  if (ratio > 0.3) return 'bg-brand/50'
  return 'bg-brand/25'
}

const HEAR_ABOUT_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  referral: 'Friend or colleague',
  search: 'Google search',
  other: 'Other',
}

function formatClassLabel(classDate) {
  const d = new Date(`${classDate.date}T00:00:00`)
  const formatted = Number.isNaN(d.getTime())
    ? classDate.date
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  return classDate.label ? `${formatted} — ${classDate.label}` : formatted
}

export default function AnalyticsPanel({ postViews, postLikes, daily, posts, classDates = [], students = [], inquiries = [] }) {
  const totalViews = Object.values(postViews).reduce((sum, n) => sum + n, 0)
  const totalLikes = Object.values(postLikes).reduce((sum, n) => sum + n, 0)
  const last30Days = sumLastNDays(daily, 30)
  const topPosts = posts
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      views: postViews[post.slug] || 0,
      likes: postLikes[post.slug] || 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
  const maxTopViews = Math.max(1, ...topPosts.map((post) => post.views))
  const WEEKS = 12
  const { days, max, monthLabels, rangeStart, rangeEnd } = buildHeatmap(daily, WEEKS)

  const revenueByClass = classDates
    .map((d) => ({
      id: d.id,
      label: formatClassLabel(d),
      revenue: students.filter((s) => s.classDate === d.date).reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0),
    }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
  const maxRevenue = Math.max(1, ...revenueByClass.map((c) => c.revenue))
  const totalRevenue = revenueByClass.reduce((sum, c) => sum + c.revenue, 0)

  const sourceCounts = inquiries.reduce((acc, inquiry) => {
    const key = inquiry.hearAbout || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const sourceBreakdown = Object.entries(sourceCounts)
    .map(([key, count]) => ({ key, label: HEAR_ABOUT_LABELS[key] || 'Unknown', count }))
    .sort((a, b) => b.count - a.count)
  const maxSourceCount = Math.max(1, ...sourceBreakdown.map((s) => s.count))

  const convertedCount = inquiries.filter((i) => i.studentId).length
  const conversionRate = inquiries.length > 0 ? Math.round((convertedCount / inquiries.length) * 100) : 0

  return (
    <div className="mt-10">
      <h2 className="font-display text-lg font-bold italic text-ink">Analytics</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs text-neutral-500">Total article views</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{totalViews.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs text-neutral-500">Total likes</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{totalLikes.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs text-neutral-500">Views, last 30 days</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{last30Days.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs text-neutral-500">
          Traffic, {formatShortDate(rangeStart)} – {formatShortDate(rangeEnd)}
        </p>
        <div className="mt-3 overflow-x-auto">
          <div
            className="grid w-max gap-[3px]"
            style={{ gridTemplateColumns: `24px repeat(${WEEKS}, 13px)`, gridTemplateRows: '14px repeat(7, 13px)' }}
          >
            <div style={{ gridColumn: 1, gridRow: 1 }} />
            {monthLabels.map((label, w) =>
              label ? (
                <div
                  key={`month-${w}`}
                  className="text-[9px] text-neutral-400"
                  style={{ gridColumn: w + 2, gridRow: 1 }}
                >
                  {label}
                </div>
              ) : null
            )}
            {DAY_LABELS.map((label, dow) => (
              <div
                key={`day-${dow}`}
                className="text-[9px] leading-[13px] text-neutral-400"
                style={{ gridColumn: 1, gridRow: dow + 2 }}
              >
                {label}
              </div>
            ))}
            {days.map((day, i) => {
              const week = Math.floor(i / 7)
              const dow = i % 7
              return (
                <div
                  key={day.date}
                  title={day.isFuture ? undefined : `${formatShortDate(day.date)}: ${day.count} view${day.count === 1 ? '' : 's'}`}
                  className={`size-[13px] rounded-[2px] ${cellClass(day.count, max, day.isFuture)}`}
                  style={{ gridColumn: week + 2, gridRow: dow + 2 }}
                />
              )
            })}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
          <span>Less</span>
          <div className="size-[13px] rounded-[2px] bg-neutral-100" />
          <div className="size-[13px] rounded-[2px] bg-brand/25" />
          <div className="size-[13px] rounded-[2px] bg-brand/50" />
          <div className="size-[13px] rounded-[2px] bg-brand/75" />
          <div className="size-[13px] rounded-[2px] bg-brand" />
          <span>More</span>
        </div>
      </div>

      {totalViews === 0 ? (
        <p className="mt-4 text-xs text-neutral-400">
          No article views tracked yet — this fills in as people read your posts.
        </p>
      ) : (
        topPosts.length > 0 && (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs text-neutral-500">Most-read articles</p>
            <div className="mt-3 space-y-3">
              {topPosts.map((post) => (
                <div key={post.slug}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <p className="truncate text-ink">{post.title}</p>
                    <div className="flex shrink-0 items-center gap-3 tabular-nums text-neutral-500">
                      <StatCount icon="eye" count={post.views} />
                      <StatCount icon="heart" count={post.likes} />
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${Math.max(4, (post.views / maxTopViews) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {(revenueByClass.length > 0 || sourceBreakdown.length > 0 || inquiries.length > 0) && (
        <>
          <h2 className="mt-10 font-display text-lg font-bold italic text-ink">Workshop</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {revenueByClass.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs text-neutral-500">Revenue by class · {totalRevenue.toLocaleString()} MMK total</p>
                <div className="mt-3 space-y-3">
                  {revenueByClass.map((c) => (
                    <div key={c.id}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <p className="truncate text-ink">{c.label}</p>
                        <span className="shrink-0 tabular-nums text-neutral-500">{c.revenue.toLocaleString()} MMK</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${Math.max(4, (c.revenue / maxRevenue) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sourceBreakdown.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs text-neutral-500">How inquiries heard about the workshop</p>
                <div className="mt-3 space-y-3">
                  {sourceBreakdown.map((s) => (
                    <div key={s.key}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <p className="text-ink">{s.label}</p>
                        <span className="shrink-0 tabular-nums text-neutral-500">{s.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${Math.max(4, (s.count / maxSourceCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {inquiries.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs text-neutral-500">Total inquiries</p>
                <p className="mt-1 text-3xl font-semibold text-ink">{inquiries.length}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs text-neutral-500">Converted to students</p>
                <p className="mt-1 text-3xl font-semibold text-ink">{convertedCount}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs text-neutral-500">Conversion rate</p>
                <p className="mt-1 text-3xl font-semibold text-ink">{conversionRate}%</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
