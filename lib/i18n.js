import { cookies } from 'next/headers'
import { LOCALE_COOKIE, DEFAULT_LOCALE, LOCALES } from './dictionaries'

export async function getLocale() {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return LOCALES.includes(value) ? value : DEFAULT_LOCALE
}
