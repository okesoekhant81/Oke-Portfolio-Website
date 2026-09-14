// Optional best-effort email sending — env-var-gated the same way
// isBlobConfigured/isTelegramConfigured were, so it silently no-ops until
// RESEND_API_KEY/EMAIL_FROM are set rather than erroring. Resend's HTTP API
// over an SDK/SMTP library since it needs no extra package, just an API key
// and a fetch call — same reasoning the old Telegram notifier used.
export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)

// Never throws — every caller treats email as a nice-to-have side effect of
// the thing it's actually doing (a registration, a conversion, a reminder),
// so a delivery failure is logged and swallowed rather than surfaced to the
// visitor or allowed to roll back a real mutation that already succeeded.
export async function sendEmail({ to, subject, html }) {
  if (!isEmailConfigured) return { sent: false }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
    })
    if (!res.ok) {
      console.error('sendEmail failed', res.status, await res.text().catch(() => ''))
      return { sent: false }
    }
    return { sent: true }
  } catch (err) {
    console.error('sendEmail error', err)
    return { sent: false }
  }
}
