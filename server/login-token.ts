import { query, querySingle, SQL } from '../util/db.ts'
import { randomHash } from './hash.ts'

/**
 * Half an hour. A login mail is read while the visitor is still sitting there waiting for it, so
 * this only has to cover a slow mail server, not a change of mind.
 */
export const LOGIN_TOKEN_TTL_SECONDS = 30 * 60

/**
 * One mail per address per minute. The form behind this takes any address from anybody, so
 * without a cooldown it is a mail bomb aimed at whoever the typist names.
 */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Deliberately has no `next/headers` import, so the cron process can reach
 * {@link deleteExpiredLoginTokens}.
 */

/**
 * A token for `mail`, or undefined when one went out inside the cooldown and is presumably still
 * in flight. The caller must tell the visitor the same thing either way — which of the two
 * happened is only interesting to somebody probing the form.
 */
export const createLoginToken = async (mail: string): Promise<string | undefined> => {
  const recent = await querySingle<{ hash: string }>(
    SQL`SELECT hash FROM login_token
WHERE mail = ${mail} AND created > now() - make_interval(secs => ${RESEND_COOLDOWN_SECONDS})
ORDER BY created DESC
LIMIT 1`,
  )
  if (recent !== undefined) {
    return undefined
  }

  const hash = randomHash()
  await query(
    SQL`INSERT INTO login_token (hash, mail, expires)
VALUES (${hash}, ${mail}, now() + make_interval(secs => ${LOGIN_TOKEN_TTL_SECONDS}))`,
  )
  return hash
}

/**
 * Spends a token and says whose it was. The row goes whether or not it was still live, so a
 * link works exactly once and a second click gets nothing.
 *
 * Postgres decides whether it had expired rather than the caller: these columns are
 * `TIMESTAMP` without a zone, and comparing one against a JavaScript `Date` means reasoning
 * about which zone the app process happens to be running in.
 */
export const consumeLoginToken = async (hash: string): Promise<string | undefined> => {
  const row = await querySingle<{ mail: string; live: boolean }>(
    SQL`DELETE FROM login_token WHERE hash = ${hash} RETURNING mail, expires > now() AS live`,
  )
  return row?.live === true ? row.mail : undefined
}

/** Housekeeping for the tokens nobody ever clicked. The hourly cron job runs it. */
export const deleteExpiredLoginTokens = async (): Promise<number> => {
  const result = await query(SQL`DELETE FROM login_token WHERE expires <= now()`)
  return result.rowCount ?? 0
}
