import type { AdminAccount, AppAccount } from '../shared/index.ts'
import { isMailValid, normalizeMail } from '../shared/mail-util.ts'
import { query, querySingle, SQL } from '../util/db.ts'
import { randomHash } from './hash.ts'

export const confirmAccountExistance = async (mail: string, validated = false): Promise<void> => {
  if (!isMailValid(mail)) {
    throw new Error(`Confirm account failure. Mail is invalid: ${mail}`)
  }
  await query(
    SQL`INSERT INTO mail (mail, hash, validated) VALUES(${mail}, ${randomHash()}, ${validated})
ON CONFLICT (mail) DO NOTHING`,
  )
}

export const validateAccount = async (mail: string): Promise<void> => {
  await confirmAccountExistance(mail, true)
  await query(SQL`UPDATE mail SET validated = true WHERE mail = ${mail}`)
}

export const getAccountByHash = async (hash: string): Promise<AppAccount | undefined> =>
  querySingle<AppAccount>(SQL`SELECT mail, validated, blocked FROM mail WHERE hash = ${hash}`)

/** The account for an address a visitor typed, in whatever case they typed it. */
export const getAccountByMail = async (mail: string): Promise<AppAccount | undefined> =>
  querySingle<AppAccount>(
    SQL`SELECT mail, validated, blocked FROM mail WHERE mail = ${normalizeMail(mail)}`,
  )

export const getAccountHashByMail = async (mail: string): Promise<string> => {
  const entry = await querySingle<{ hash: string }>(SQL`SELECT hash FROM mail WHERE mail = ${mail}`)
  if (entry === undefined) {
    throw new Error(`account not found. Mail: "${mail}"`)
  }
  return entry.hash
}

// returns false if no account was found
export const setAccountBlocked = async (hash: string, blocked: boolean): Promise<boolean> => {
  const result = await query(SQL`UPDATE mail SET blocked = ${blocked} WHERE hash = ${hash}`)
  return (result.rowCount ?? 0) > 0
}

/** Every account that has unsubscribed, for the admin view. */
export const adminGetBlockedAccounts = async (): Promise<AdminAccount[]> => {
  const cursor = await query<AdminAccount>(
    SQL`SELECT mail, hash, validated, blocked FROM mail WHERE blocked IS true ORDER BY mail`,
  )
  return cursor.rows
}

/** The mail rows behind a set of addresses, for the admin view. */
export const adminGetAccounts = async (mails: string[]): Promise<AdminAccount[]> => {
  if (mails.length === 0) {
    return []
  }
  const cursor = await query<AdminAccount>(
    SQL`SELECT mail, hash, validated, blocked FROM mail WHERE mail = ANY(${mails})`,
  )
  return cursor.rows
}
