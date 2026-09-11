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

export default function AnalyticsPanel({ postViews, daily, posts }) {
  const totalViews = Object.values(postViews).reduce((sum, n) => sum + n, 0)
  const last30Days = sumLastNDays(daily, 30)
  const topPosts = posts
    .map((post) => ({ slug: post.slug, title: post.title, views: postViews[post.slug] || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
  const maxTopViews = Math.max(1, ...topPosts.map((post) => post.views))
  const WEEKS = 12
  const { days, max, monthLabels, rangeStart, rangeEnd } = buildHeatmap(daily, WEEKS)

  return (
    <div className="mt-10">
      <h2 className="font-display text-lg font-bold italic text-ink">Analytics</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs text-neutral-500">Total article views</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{totalViews.toLocaleString()}</p>
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
                    <p className="shrink-0 tabular-nums text-neutral-500">{post.views}</p>
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
    </div>
  )
}
