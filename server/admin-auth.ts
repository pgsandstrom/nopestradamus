import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import { getConfig } from '../util/config.ts'

/**
 * Deliberately not in a 'use server' file: every export of one is a POST-able endpoint, and
 * a password check reachable from outside is a brute-force oracle. The login action in
 * `app/admin/actions.ts` is the one place that may reach a password check from a request, and
 * it goes through `attemptAdminLogin`, which is throttled.
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000

const equals = (a: string, b: string): boolean => {
  const actual = Buffer.from(a)
  const expected = Buffer.from(b)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

const isAdminPassword = (password: string): boolean => equals(password, getConfig().adminPassword)

const sign = (payload: string, secret: string): string =>
  createHmac('sha256', secret).update(payload).digest('base64url')

/**
 * `<expiry ms>.<nonce>.<signature>`. There is one admin, so the token carries no identity —
 * only when it stops being valid, plus a nonce so two sessions never share a cookie value.
 *
 * The secret is passed in rather than read here so the unit test needs no `config.json`;
 * production callers hand it {@link adminSessionSecret}.
 */
export function createSessionToken(secret: string, now: number = Date.now()): string {
  const payload = `${now + SESSION_TTL_MS}.${randomBytes(16).toString('base64url')}`
  return `${payload}.${sign(payload, secret)}`
}

export function isSessionTokenValid(
  token: string,
  secret: string,
  now: number = Date.now(),
): boolean {
  const signatureAt = token.lastIndexOf('.')
  if (signatureAt === -1) {
    return false
  }
  const payload = token.slice(0, signatureAt)
  // signature first: only then is the expiry in the payload worth reading
  if (!equals(token.slice(signatureAt + 1), sign(payload, secret))) {
    return false
  }
  return Number(payload.slice(0, payload.indexOf('.'))) > now
}

/**
 * Signing sessions with the admin password itself means changing it in `config.json` logs out
 * every session minted under the old one, and saves carrying a second secret around.
 */
export const adminSessionSecret = (): string => getConfig().adminPassword

interface LoginThrottle {
  /** Seconds until the next attempt is allowed, or 0 when one is allowed right now. */
  retryInSeconds: (now?: number) => number
  recordFailure: (now?: number) => void
  reset: () => void
}

const FREE_ATTEMPTS = 3
const FIRST_LOCKOUT_MS = 5_000
const MAX_LOCKOUT_MS = 5 * 60_000

/** Exported for the unit test; production uses the single instance below. */
export function createLoginThrottle(): LoginThrottle {
  let failures = 0
  let lockedUntil = 0

  return {
    retryInSeconds: (now = Date.now()) => Math.max(0, Math.ceil((lockedUntil - now) / 1000)),
    recordFailure: (now = Date.now()) => {
      failures += 1
      if (failures > FREE_ATTEMPTS) {
        const lockout = FIRST_LOCKOUT_MS * 2 ** (failures - FREE_ATTEMPTS - 1)
        lockedUntil = now + Math.min(lockout, MAX_LOCKOUT_MS)
      }
    },
    reset: () => {
      failures = 0
      lockedUntil = 0
    },
  }
}

/**
 * One bucket for the whole process, not one per caller: there is a single password, so per-IP
 * buckets would only be something to rotate around. The cost is that someone hammering the form
 * keeps the real admin waiting too — the better trade when the alternative is an unmetered
 * guessing loop against one short password.
 */
const loginThrottle = createLoginThrottle()

export type AdminLoginResult = { ok: true } | { ok: false; retryInSeconds: number }

/**
 * A `retryInSeconds` above 0 means the caller is locked out for that long — either the attempt
 * was refused without looking at the password, or it was the wrong password that tripped the
 * lockout. Callers should not distinguish the two in what they tell the visitor.
 */
export function attemptAdminLogin(password: string): AdminLoginResult {
  const waiting = loginThrottle.retryInSeconds()
  if (waiting > 0) {
    return { ok: false, retryInSeconds: waiting }
  }
  if (!isAdminPassword(password)) {
    loginThrottle.recordFailure()
    return { ok: false, retryInSeconds: loginThrottle.retryInSeconds() }
  }
  loginThrottle.reset()
  return { ok: true }
}
