import { timingSafeEqual } from 'node:crypto'

import { getConfig } from '../util/config.ts'

/**
 * Deliberately not in a 'use server' file: every export of one is a POST-able endpoint, and
 * a password check reachable from outside is a brute-force oracle. Callers are server-only.
 */
export const isAdminPassword = (password: string): boolean => {
  const expected = Buffer.from(getConfig().adminPassword)
  const actual = Buffer.from(password)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
