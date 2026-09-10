import { Pool, type QueryConfig, type QueryResult, type QueryResultRow, types } from 'pg'

// Force count-function in database to return number instead of string
// https://github.com/brianc/node-pg-types#use
types.setTypeParser(types.builtins.INT8, (val: string) => parseInt(val, 10))

let dbPool: Pool | undefined

const getDbPool = (): Pool => {
  dbPool ??= new Pool({
    host: process.env.PGHOST ?? (process.env.NODE_ENV === 'production' ? 'db' : 'localhost'),
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE ?? 'nopestradamus',
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? 'postgres',
  })
  return dbPool
}

/**
 * Recursively replaces null with undefined, so callers can use optional properties
 * instead of having to handle both null and undefined.
 */
function nullToUndefined(item: unknown): unknown {
  if (Array.isArray(item)) {
    return item.map(nullToUndefined)
  }
  if (item === null) {
    return undefined
  }
  if (typeof item === 'object' && !(item instanceof Date)) {
    const source = item as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(source)) {
      result[key] = nullToUndefined(source[key])
    }
    return result
  }
  return item
}

export const query = async <T extends QueryResultRow>(
  config: QueryConfig,
): Promise<QueryResult<T>> => {
  const queryResult = await getDbPool().query<T>(config)
  queryResult.rows = nullToUndefined(queryResult.rows) as T[]
  return queryResult
}

export const queryString = async <T extends QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<T>> => {
  const queryResult = await getDbPool().query<T>(text, values)
  queryResult.rows = nullToUndefined(queryResult.rows) as T[]
  return queryResult
}

export const querySingle = async <T extends QueryResultRow>(
  config: QueryConfig,
): Promise<T | undefined> => {
  const result = await query<T>(config)
  if (result.rowCount == null || result.rowCount > 1) {
    throw new Error(`Unexpected number of rows: ${result.rowCount}`)
  }
  return result.rows[0]
}

/**
 * Tagged template that builds a parameterised query, so values are never interpolated
 * into the SQL string: SQL`SELECT * FROM x WHERE id = ${id}` -> 'SELECT * FROM x WHERE id = $1'.
 */
export const SQL = (parts: TemplateStringsArray, ...values: unknown[]): QueryConfig => ({
  text: parts.reduce((text, part, i) => `${text}$${i}${part}`),
  values,
})
