import { cookies } from 'next/headers'

import { isDev } from '../util/env.ts'
import {
  adminSessionSecret,
  createSessionToken,
  isSessionTokenValid,
  SESSION_TTL_SECONDS,
} from './admin-auth.ts'

// Next-only, so it lives apart from admin-auth.ts, which the cron process could reach.
const COOKIE = 'admin_session'

/** Only ever called from a server action — cookies cannot be set while a page renders. */
export async function startAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE, createSessionToken(adminSessionSecret()), {
    httpOnly: true,
    // dev runs on plain http, where a secure cookie would simply be dropped
    secure: !isDev(),
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

/** Only ever called from a server action, same reason as {@link startAdminSession}. */
export async function endAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE)
}

/**
 * The one gate. Every admin page and every admin action asks this for itself rather than
 * trusting an ancestor: a layout does not re-render on client-side navigation between the
 * pages under it, so a session that expired mid-visit would still look live from there.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value
  return token !== undefined && isSessionTokenValid(token, adminSessionSecret())
}
