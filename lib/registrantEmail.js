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

// Sent once the admin actually marks a student's payment as paid (see
// updateStudentPaymentAction in app/actions/students.js) — deliberately
// not at registration time, since a submitted registration isn't a
// confirmed seat until the admin has checked the payment themselves.
// `classInfo` is the matched class-date record (date/time/label) and
// `workshop` is the already-locale-picked workshop content (for
// heroTitle/heroSubtitle as the course name, and sessionPlatform/
// sessionLanguage) — both required, since there's nothing meaningful to
// confirm without a specific class to point to.
export async function sendRegistrationConfirmation(student, classInfo, workshop, locale = 'en') {
  if (!student.email || !classInfo) return

  const isMy = locale === 'my'
  const courseName = `${workshop.heroTitle} ${workshop.heroSubtitle}`.trim()

  const detailRow = (label, value) =>
    value ? `<tr><td style="padding:2px 12px 2px 0;color:#737373">${label}</td><td style="padding:2px 0;font-weight:600">${value}</td></tr>` : ''

  // sourceInquiryId when this student came from a converted public
  // registration — falling back to the student's own id only covers a
  // student added directly by an admin, with no original inquiry. Using
  // student.id unconditionally here would show a *different* ID than the
  // one the registrant already saw and saved from the success screen
  // (which shows the inquiry's own id), since convertInquiryToStudentAction
  // always generates a fresh id for the new student record.
  const registrationId = (student.sourceInquiryId || student.id)?.toUpperCase()

  const detailsTable = `<table style="margin:16px 0;border-collapse:collapse;font-size:14px">
    ${detailRow(isMy ? 'မှတ်ပုံတင်အမှတ်' : 'Registration ID', registrationId)}
    ${detailRow(isMy ? 'ရက်စွဲ' : 'Date', formatDate(classInfo.date, locale))}
    ${detailRow(isMy ? 'အချိန်' : 'Time', classInfo.time)}
    ${detailRow(isMy ? 'နေရာ / Platform' : 'Location / Platform', workshop.sessionPlatform)}
    ${detailRow(isMy ? 'ဘာသာစကား' : 'Language', workshop.sessionLanguage)}
  </table>`

  // The paragraph and signature title are admin-editable (see the
  // "Registration Email" section of the Workshop admin page) — `workshop`
  // is already locale-picked by the caller, so these two are ready to drop
  // straight in without their own isMy branch, same as sessionPlatform/
  // sessionLanguage above. Everything else here (greeting, the Workshop
  // Details heading, the standard closing lines) is fixed template text.
  const bodyEn = `
    <p style="margin:0 0 12px">Hello ${student.name},</p>
    <p style="margin:0 0 12px">Thank you for registering for the ${courseName}.</p>
    <p style="margin:0 0 12px">We're happy to confirm that your registration has been successfully received and your seat is now confirmed.</p>
    <p style="margin:0 0 4px;font-weight:700">Workshop Details</p>
    ${detailsTable}
    <p style="margin:0 0 12px">${workshop.paymentConfirmedBody}</p>
    <p style="margin:0 0 12px">Before the workshop, we'll send you any important preparation notes, materials, or updates you may need.</p>
    <p style="margin:0 0 12px">If you have any questions before the session, feel free to reply to this email.</p>
    <p style="margin:0 0 20px">We look forward to seeing you at the workshop.</p>
    <p style="margin:0">Best regards,<br/>${SITE_NAME}<br/>${workshop.paymentConfirmedSignature}</p>
  `

  const bodyMy = `
    <p style="margin:0 0 12px">မင်္ဂလာပါ ${student.name},</p>
    <p style="margin:0 0 12px">${courseName} အတွက် စာရင်းသွင်းပေးတဲ့အတွက် ကျေးဇူးတင်ပါတယ်။</p>
    <p style="margin:0 0 12px">သင့်ရဲ့ စာရင်းသွင်းမှုကို လက်ခံရရှိပြီး နေရာအတည်ပြုပြီးဖြစ်ကြောင်း ဝမ်းသာစွာ အသိပေးအပ်ပါတယ်။</p>
    <p style="margin:0 0 4px;font-weight:700">Workshop အသေးစိတ်</p>
    ${detailsTable}
    <p style="margin:0 0 12px">${workshop.paymentConfirmedBody}</p>
    <p style="margin:0 0 12px">Workshop မစခင် လိုအပ်တဲ့ ပြင်ဆင်မှု မှတ်စု၊ material (သို့) update များကို ကြိုတင်ပို့ပေးပါမယ်။</p>
    <p style="margin:0 0 12px">Session မစခင် မေးခွန်းရှိရင် ဒီ email ကိုပဲ reply ပြန်လို့ရပါတယ်။</p>
    <p style="margin:0 0 20px">Workshop မှာ တွေ့ဆုံရမှာကို စောင့်မျှော်နေပါတယ်။</p>
    <p style="margin:0">လေးစားစွာဖြင့်၊<br/>${SITE_NAME}<br/>${workshop.paymentConfirmedSignature}</p>
  `

  await sendEmail({
    to: student.email,
    subject: workshop.paymentConfirmedSubject,
    html: wrap(isMy ? bodyMy : bodyEn),
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
