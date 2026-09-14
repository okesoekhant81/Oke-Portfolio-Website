import { sendEmail } from './email'

// Admin-facing notifications — separate from the registrant-facing
// confirmation/reminder emails in lib/registrantEmail.js, since this one is
// gated on ADMIN_NOTIFY_EMAIL (where to send it) rather than the visitor's
// own address.
export async function notifyNewInquiry(inquiry) {
  if (!process.env.ADMIN_NOTIFY_EMAIL) return

  const rows = [
    ['Name', inquiry.name],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone],
    ['Class date', inquiry.classDate],
    ['Business', inquiry.business],
  ].filter(([, value]) => value)

  await sendEmail({
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `New workshop inquiry: ${inquiry.name}`,
    html: `<h2>New workshop inquiry</h2><table>${rows
      .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${value}</td></tr>`)
      .join('')}</table>`,
  })
}

// Fired once a day (see app/api/cron/class-reminders/route.js) for every
// class happening tomorrow, so the admin remembers to print the roster and
// prep before walking in the next morning rather than the night before.
export async function notifyAdminClassReminder(classInfo, studentCount) {
  if (!process.env.ADMIN_NOTIFY_EMAIL) return

  await sendEmail({
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `Reminder: "${classInfo.label || 'Workshop'}" is tomorrow`,
    html: `<p>Your class on <strong>${classInfo.date}</strong>${
      classInfo.label ? ` (${classInfo.label})` : ''
    } runs tomorrow, with <strong>${studentCount}</strong> student${studentCount === 1 ? '' : 's'} registered.</p><p>Don't forget to print the roster/attendance sheet.</p>`,
  })
}
