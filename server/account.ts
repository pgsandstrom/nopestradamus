import { randomUUID } from 'node:crypto'

import type { AppAccount } from '../shared/index.ts'
import { isMailValid } from '../shared/mail-util.ts'
import { query, querySingle, SQL } from '../util/db.ts'

export const confirmAccountExistance = async (mail: string, validated = false): Promise<void> => {
  if (!isMailValid(mail)) {
    throw new Error(`Confirm account failure. Mail is invalid: ${mail}`)
  }
  await query(
    SQL`INSERT INTO mail (mail, hash, validated) VALUES(${mail}, ${randomUUID()}, ${validated})
ON CONFLICT (mail) DO NOTHING`,
  )
}

export const validateAccount = async (mail: string): Promise<void> => {
  await confirmAccountExistance(mail, true)
  await query(SQL`UPDATE mail SET validated = true WHERE mail = ${mail}`)
}

export const getAccountByHash = async (hash: string): Promise<AppAccount | undefined> =>
  querySingle<AppAccount>(SQL`SELECT mail, validated, blocked FROM mail WHERE hash = ${hash}`)

export const getAccountHashByMail = async (mail: string): Promise<string> => {
  const entry = await querySingle<{ hash: string }>(SQL`SELECT hash FROM mail WHERE mail = ${mail}`)
  if (entry === undefined) {
    throw new Error(`account not found. Mail: "${mail}"`)
  }
  return entry.hash
}

export const setAccountBlocked = async (hash: string, blocked: boolean): Promise<void> => {
  await query(SQL`UPDATE mail SET blocked = ${blocked} WHERE hash = ${hash}`)
}
