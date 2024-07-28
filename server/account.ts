import { v4 as uuidv4 } from 'uuid'

import { query, querySingle, SQL } from '../util/db'
import { QueryResult } from 'pg'
import { isMailValid } from '../shared/mail-util'
import { AppAccount } from '../shared'

// TODO add database constraints and indexes and stuff

export const confirmAccountExistance = async (mail: string, validated = false) => {
  if (!isMailValid(mail)) {
    throw new Error(`Confirm account failure. Mail is invalid: ${mail}`)
  }
  const hash = uuidv4()
  const result = await query(SQL`SELECT count(*) FROM mail WHERE mail = ${mail}`).then(
    (cursor: QueryResult) => cursor.rows[0] as { count: number },
  )
  if (result.count === 0) {
    await query(
      SQL`INSERT INTO mail (mail, hash, validated) VALUES(${mail}, ${hash}, ${validated})`,
    )
  }
}

export const validateAccount = async (mail: string) => {
  await confirmAccountExistance(mail, true)

  await query(SQL`UPDATE mail SET validated = true WHERE mail = ${mail}`)
}

export const getAccountByHash = async (hash: string): Promise<AppAccount> => {
  const account = await querySingle<AppAccount>(
    SQL`SELECT mail, validated, blocked FROM mail WHERE hash = ${hash}`,
  )

  if (account === undefined) {
    throw new Error('account not found')
  }

  return account
}

export const getAccountHashByMail = async (mail: string): Promise<string> => {
  const entry = await querySingle<{ hash: string }>(SQL`SELECT hash FROM mail WHERE mail = ${mail}`)

  if (entry === undefined) {
    throw new Error('account not found')
  }

  return entry.hash
}

export const setAccountBlocked = async (hash: string, blocked: boolean) => {
  await query(SQL`UPDATE mail SET blocked = ${blocked} WHERE hash = ${hash}`)
}
