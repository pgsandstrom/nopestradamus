import { QueryConfig, Pool } from 'pg'
import config from './config'

const databaseConfig = config().database

let dbPool: Pool
const getDbPool = () => {
  if (dbPool == null) {
    console.log('creating pool')
    dbPool = new Pool(databaseConfig)
  }
  return dbPool
}

// Use this for single query
export const query = (stuff: QueryConfig) => getDbPool().query(stuff)
export const queryString = (stuff: string) => getDbPool().query(stuff)

// Use this to gain a client for multiple operations, such as transactions
export const getClient = () =>
  new Promise((resolve, reject) => {
    getDbPool().connect((err, client) => {
      if (err) {
        reject(err)
      } else {
        resolve(client)
      }
    })
  })

export const SQL = (parts: TemplateStringsArray, ...values: any[]) => ({
  text: parts.reduce((prev, curr, i) => prev + '$' + i + curr), // eslint-disable-line prefer-template
  values,
})
