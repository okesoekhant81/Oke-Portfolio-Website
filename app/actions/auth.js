'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, SESSION_MAX_AGE_MS, createSessionToken } from '../../lib/auth'
import { checkLockout, recordFailedAttempt, clearFailedAttempts } from '../../lib/loginAttempts'
import { clientIp } from '../../lib/clientIp'

export async function login(prevState, formData) {
  const password = formData.get('password')

  if (!process.env.ADMIN_PASSWORD) {
    return { error: 'ADMIN_PASSWORD is not set on the server yet.' }
  }

  const ip = await clientIp()

  const lockout = await checkLockout(ip)
  if (lockout.locked) {
    const minutes = Math.ceil(lockout.retryAfterSeconds / 60)
    return { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    await recordFailedAttempt(ip)
    // Slows brute-force throughput even if the lockout above hasn't
    // kicked in yet for this window.
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { error: 'Incorrect password.' }
  }

  await clearFailedAttempts(ip)

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS / 1000,
  })

  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/admin/login')
}
