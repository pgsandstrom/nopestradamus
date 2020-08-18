import { Pool, PoolClient, QueryConfig, QueryResult, types, QueryResultRow } from 'pg'
import config from './config'

const databaseConfig = config().database

// TODO null returning instead of undefined from database might screw us. Can we transform all null to undefined?

// Force count-function in database to return number instead of string
// https://github.com/brianc/node-pg-types#use
types.setTypeParser(20, (val: string) => {
  return parseInt(val, 10)
})

let dbPool: Pool | undefined
const getDbPool = () => {
  if (dbPool === undefined) {
    console.log('creating pool')
    dbPool = new Pool(databaseConfig)
  }
  return dbPool
}

// Use this for single query
export const query = (stuff: QueryConfig) => getDbPool().query(stuff)
export function queryString<R extends QueryResultRow = any>(stuff: string, values?: any[]) {
  return getDbPool().query<R>(stuff, values)
}

export const querySingle = async <T = any>(stuff: QueryConfig) => {
  const result: QueryResult = await getDbPool().query(stuff)
  return getSingle<T>(result)
}

export const querySingleString = async <T = any>(stuff: string, values?: any[]) => {
  const result: QueryResult = await getDbPool().query(stuff, values)
  return getSingle<T>(result)
}

const getSingle = <T>(result: QueryResult): T | undefined => {
  if (result.rowCount > 1) {
    throw new Error(`Unexpected number of rows: ${result.rowCount}`)
  } else if (result.rowCount === 0) {
    return undefined
  } else {
    return result.rows[0] as T
  }
}

// Use this to gain a client for multiple operations, such as transactions
export const getClient = (): Promise<PoolClient> =>
  new Promise((resolve, reject) => {
    getDbPool().connect((err, client: PoolClient) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (err !== undefined) {
        reject(err)
      } else {
        resolve(client)
      }
    })
  })

export const SQL = (parts: TemplateStringsArray, ...values: any[]): QueryConfig => ({
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  text: parts.reduce((prev, curr, i) => prev + '$' + i + curr), // eslint-disable-line prefer-template
  values,
})
