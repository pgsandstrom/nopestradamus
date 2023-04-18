import { Pool, PoolClient, QueryConfig, QueryResult, QueryResultRow, types } from 'pg'
import config from './config'
import { nullToUndefined } from '../../../frontend/shared/object-util'

const databaseConfig = config().database

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

// TODO: in query and queryString we mutate the queryResult. Is that dangerous? Read up on it.
export const query = async <T extends QueryResultRow = any>(
  stuff: QueryConfig,
): Promise<QueryResult<T>> => {
  const queryResult = await getDbPool().query<T>(stuff)
  queryResult.rows = nullToUndefined(queryResult.rows) as T[]
  return queryResult
}

export async function queryString<R extends QueryResultRow = any>(stuff: string, values?: any[]) {
  const queryResult = await getDbPool().query<R>(stuff, values)
  queryResult.rows = nullToUndefined(queryResult.rows) as R[]
  return queryResult
}

export const querySingle = async <T extends QueryResultRow = any>(stuff: QueryConfig) => {
  const result: QueryResult<T> = await getDbPool().query(stuff)
  return nullToUndefined(getSingle<T>(result)) as T | undefined
}

export const querySingleString = async <T extends QueryResultRow = any>(
  stuff: string,
  values?: any[],
) => {
  const result: QueryResult<T> = await getDbPool().query(stuff, values)
  return nullToUndefined(getSingle<T>(result)) as T
}

const getSingle = <T extends QueryResultRow>(result: QueryResult<T>): T | undefined => {
  if (result.rowCount > 1) {
    throw new Error(`Unexpected number of rows: ${result.rowCount}`)
  } else if (result.rowCount === 0) {
    return undefined
  } else {
    return result.rows[0]
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
