// Optional best-effort notification when a new workshop inquiry comes in —
// env-var-gated the same way isBlobConfigured is, so it silently no-ops
// until TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID are set rather than erroring.
// Telegram over email/SMS since it needs no extra package or paid service —
// just a bot token and a fetch call.
export const isTelegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)

export async function notifyNewInquiry(inquiry) {
  if (!isTelegramConfigured) return

  const lines = [
    `New workshop inquiry: ${inquiry.name}`,
    inquiry.email && `Email: ${inquiry.email}`,
    inquiry.phone && `Phone: ${inquiry.phone}`,
    inquiry.classDate && `Class date: ${inquiry.classDate}`,
    inquiry.business && `Business: ${inquiry.business}`,
  ].filter(Boolean)

  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: lines.join('\n') }),
    })
  } catch {
    // Best-effort only — a notification failure should never block or fail
    // the registration itself.
  }
}
