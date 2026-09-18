import { cookies } from 'next/headers'

import { isDev } from '../util/env.ts'
import { createSession, deleteSession, getSessionMail, SESSION_TTL_SECONDS } from './session.ts'

// Next-only, so it lives apart from session.ts, which the cron process reaches for its sweep.
const COOKIE = 'session'

/** Only ever called from a server action — cookies cannot be set while a page renders. */
export async function startUserSession(mail: string): Promise<void> {
  const hash = await createSession(mail)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE, hash, {
    httpOnly: true,
    // dev runs on plain http, where a secure cookie would simply be dropped
    secure: !isDev(),
    // 'lax' rather than the admin cookie's 'strict': these links are followed out of a mail
    // client, and a strict cookie is withheld on exactly that first cross-site navigation, so
    // every visit from a mail would render logged out before correcting itself.
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

/** Only ever called from a server action, same reason as {@link startUserSession}. */
export async function endUserSession(): Promise<void> {
  const cookieStore = await cookies()
  const hash = cookieStore.get(COOKIE)?.value
  if (hash !== undefined) {
    await deleteSession(hash)
  }
  cookieStore.delete(COOKIE)
}

/**
 * Who the visitor is, or undefined when they are not logged in. This is the only identity the
 * app has: everything a logged-in visitor may do is decided by looking this address up against
 * the creater and participant rows of the prediction in front of them.
 */
export async function getCurrentUserMail(): Promise<string | undefined> {
  const hash = (await cookies()).get(COOKIE)?.value
  return hash === undefined ? undefined : getSessionMail(hash)
}
