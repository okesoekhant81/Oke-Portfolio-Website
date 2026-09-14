import { NextResponse } from 'next/server'
import { getClassDates } from '../../../../lib/content/classDates'
import { getStudents } from '../../../../lib/content/students'
import { notifyAdminClassReminder } from '../../../../lib/notify'
import { sendClassReminder } from '../../../../lib/registrantEmail'
import { safeStringEqual } from '../../../../lib/safeCompare'

export const dynamic = 'force-dynamic'

function tomorrowDateString() {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

// Hit once a day by Vercel Cron (see vercel.json) — finds every class
// happening tomorrow and emails the admin plus each registered student a
// reminder. Protected by CRON_SECRET so nobody who finds the URL can
// trigger it themselves: Vercel sends `Authorization: Bearer $CRON_SECRET`
// automatically on cron-invoked requests. Required, not optional — an
// unset CRON_SECRET used to leave this endpoint wide open to anyone who
// found the URL rather than failing closed.
export async function GET(request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not set on the server.' }, { status: 500 })
  }
  const auth = request.headers.get('authorization') || ''
  if (!safeStringEqual(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = tomorrowDateString()
  const [classDates, students] = await Promise.all([getClassDates(), getStudents()])
  const classesTomorrow = classDates.filter((d) => d.date === tomorrow)

  let remindersSent = 0
  for (const classInfo of classesTomorrow) {
    const classStudents = students.filter((s) => s.classDate === classInfo.date)
    await notifyAdminClassReminder(classInfo, classStudents.length)
    for (const student of classStudents) {
      await sendClassReminder(student, classInfo, student.locale || 'en')
      remindersSent += 1
    }
  }

  return NextResponse.json({ classesTomorrow: classesTomorrow.length, remindersSent })
}
