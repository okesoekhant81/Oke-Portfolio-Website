'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, SESSION_MAX_AGE_MS, createSessionToken } from '../../lib/auth'
import { checkLockout, recordFailedAttempt, clearFailedAttempts } from '../../lib/loginAttempts'
import { clientIp } from '../../lib/clientIp'
import { logActivity } from '../../lib/activityLog'
import { verifyAdminCredentials } from '../../lib/content/adminUsers'
import { safeStringEqual } from '../../lib/safeCompare'

// Two ways in: the master ADMIN_PASSWORD (owner, works with any or no
// email — it's the bootstrap credential and always keeps working even
// before any team member has been added) or a named team member's own
// email+password checked against lib/content/adminUsers.js. Either way
// resolves to an admin name that gets signed into the session token (see
// lib/auth.js) so AdminNav can show who's signed in.
export async function login(prevState, formData) {
  const email = formData.get('email')?.toString().trim() || ''
  const password = formData.get('password')

  if (!process.env.ADMIN_PASSWORD) {
    return { error: 'ADMIN_PASSWORD is not set on the server yet.' }
  }
  if (!process.env.ADMIN_SESSION_SECRET) {
    return { error: 'ADMIN_SESSION_SECRET is not set on the server yet.' }
  }

  const ip = await clientIp()

  const lockout = await checkLockout(ip)
  if (lockout.locked) {
    const minutes = Math.ceil(lockout.retryAfterSeconds / 60)
    return { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
  }

  let adminName = null
  if (password && safeStringEqual(password, process.env.ADMIN_PASSWORD)) {
    adminName = 'Owner'
  } else if (email) {
    const user = await verifyAdminCredentials(email, password)
    if (user) adminName = user.name
  }

  if (!adminName) {
    await recordFailedAttempt(ip)
    // Slows brute-force throughput even if the lockout above hasn't
    // kicked in yet for this window.
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { error: 'Incorrect email or password.' }
  }

  await clearFailedAttempts(ip)

  const token = await createSessionToken(adminName)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS / 1000,
  })

  await logActivity('Admin login', `${adminName} (${ip})`)
  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/admin/login')
}
