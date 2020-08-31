import { v4 as uuidv4 } from 'uuid'

import { query, SQL } from '../util/db'
import { QueryResult } from 'pg'
import { isMailValid } from '../../../frontend/shared/mail-util'

// TODO add database constraints and indexes and stuff

export const confirmAccountExistance = async (mail: string, validated = false) => {
  if (!isMailValid(mail)) {
    throw new Error(`creater mail is invalid: ${mail}`)
  }
  const hash = uuidv4()
  const result = await query(SQL`SELECT count(*) FROM mail WHERE mail = ${mail}`).then(
    (cursor: QueryResult) => cursor.rows[0] as { count: string },
  )
  if (result.count === '0') {
    await query(
      SQL`INSERT INTO mail (mail, hash, validated) VALUES(${mail}, ${hash}, ${validated})`,
    )
  }
}

export const validateAccount = async (mail: string) => {
  await confirmAccountExistance(mail, true)

  await query(SQL`UPDATE mail SET validated = true WHERE mail = ${mail}`)
}
