import { query, querySingle, SQL } from '../util/db.ts'
import { randomHash } from './hash.ts'

/**
 * A month. A prediction link is read once and then forgotten about for years, so there is no
 * point keeping the session that came out of it alive for much longer than the visit — the link
 * in the mail mints a new one whenever it is opened again.
 */
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60

/**
 * Deliberately has no `next/headers` import, so the cron process can reach
 * {@link deleteExpiredSessions}. The cookie side lives in `session-cookie.ts`.
 */

export const createSession = async (mail: string): Promise<string> => {
  const hash = randomHash()
  await query(
    SQL`INSERT INTO session (hash, mail, expires)
VALUES (${hash}, ${mail}, now() + make_interval(secs => ${SESSION_TTL_SECONDS}))`,
  )
  return hash
}

/** The identity behind a session hash, or undefined when it is unknown or has run out. */
export const getSessionMail = async (hash: string): Promise<string | undefined> => {
  const row = await querySingle<{ mail: string }>(
    SQL`SELECT mail FROM session WHERE hash = ${hash} AND expires > now()`,
  )
  return row?.mail
}

export const deleteSession = async (hash: string): Promise<void> => {
  await query(SQL`DELETE FROM session WHERE hash = ${hash}`)
}

/**
 * Expired rows are already ignored by {@link getSessionMail}, so this is housekeeping rather
 * than a part of the gate. The hourly cron job runs it.
 */
export const deleteExpiredSessions = async (): Promise<number> => {
  const result = await query(SQL`DELETE FROM session WHERE expires <= now()`)
  return result.rowCount ?? 0
}
