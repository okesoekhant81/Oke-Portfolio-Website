import { sendEmail } from './email'
import { SITE_NAME, SITE_URL } from './site'

// Plain inline-styled HTML, not the site's Tailwind design system — email
// clients don't run a build step or load an external stylesheet, so every
// rule has to survive being pasted straight into an inbox.
function wrap(bodyHtml) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#171717">
    <p style="color:#e83606;font-weight:700;font-size:18px;margin:0 0 20px">${SITE_NAME}</p>
    ${bodyHtml}
    <p style="margin-top:28px;font-size:12px;color:#a3a3a3">${SITE_URL}</p>
  </div>`
}

function formatDate(dateStr, locale) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(locale === 'my' ? 'my' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Sent right after a successful workshop registration/inquiry — a receipt
// the visitor can point to, since the admin-facing notification in
// lib/notify.js tells nobody on the visitor's side that the form actually
// went through.
export async function sendRegistrationConfirmation(inquiry, locale = 'en') {
  if (!inquiry.email) return

  const isMy = locale === 'my'
  const dateLine = inquiry.classDate
    ? `<p style="margin:0 0 12px">${isMy ? 'ရွေးထားသောရက်စွဲ' : 'Class date'}: <strong>${formatDate(inquiry.classDate, locale)}</strong></p>`
    : ''

  await sendEmail({
    to: inquiry.email,
    subject: isMy ? `${SITE_NAME} — မှတ်ပုံတင်ခြင်း လက်ခံရရှိပါပြီ` : `${SITE_NAME} — Registration received`,
    html: wrap(`
      <p style="margin:0 0 12px">${isMy ? `မင်္ဂလာပါ ${inquiry.name},` : `Hi ${inquiry.name},`}</p>
      <p style="margin:0 0 12px">${
        isMy
          ? 'Workshop အတွက် မှတ်ပုံတင်ခြင်း လက်ခံရရှိပါပြီ။ အတည်ပြုပြီးရင် ဆက်သွယ်ပါမယ်။'
          : "Thanks for registering — we've received your details and will follow up to confirm your spot."
      }</p>
      ${dateLine}
    `),
  })
}

// One per registered student, sent by the daily cron
// (app/api/cron/class-reminders/route.js) for every class happening
// tomorrow — the registrant-facing half of the same "day before" reminder
// notifyAdminClassReminder sends to the admin.
export async function sendClassReminder(student, classInfo, locale = 'en') {
  if (!student.email) return

  const isMy = locale === 'my'
  await sendEmail({
    to: student.email,
    subject: isMy ? `${SITE_NAME} — မနက်ဖြန် Workshop ရှိပါသည်` : `${SITE_NAME} — Your workshop is tomorrow`,
    html: wrap(`
      <p style="margin:0 0 12px">${isMy ? `မင်္ဂလာပါ ${student.name},` : `Hi ${student.name},`}</p>
      <p style="margin:0 0 12px">${
        isMy
          ? `${formatDate(classInfo.date, locale)} တွင် ကျင်းပမည့် workshop သည် မနက်ဖြန်ကျင်းပပါမည်။`
          : `Just a reminder — your workshop on ${formatDate(classInfo.date, locale)} is tomorrow.`
      }${classInfo.label ? ` (${classInfo.label})` : ''}</p>
    `),
  })
}
