import * as uuid from 'uuid/v4'

import { query, SQL } from '../util/db'
import {QueryResult} from 'pg'

// TODO add database constraints and indexes and stuff

export const confirmAccountExistance = async (mail:string, validated = false) => {
  const hash = uuid()
  const result = await query(SQL`SELECT count(*) FROM mail WHERE mail = ${mail}`).then((cursor:QueryResult) => cursor.rows[0])
  if (result.count === '0') {
    await query(SQL`INSERT INTO mail (mail, hash, validated) VALUES(${mail}, ${hash}, ${validated})`)
  }
}

export const validateAccount = (mail:string) => confirmAccountExistance(mail, true)
