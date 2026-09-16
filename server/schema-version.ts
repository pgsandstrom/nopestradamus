/**
 * Reads which migration the database is on, for the admin header.
 */
import { query } from '../util/db.ts'

export interface SchemaVersion {
  name: string
  applied: Date
}

/**
 * The migration this database is currently on. Undefined means nothing has been applied yet:
 * either an empty database, or one from before migrations existed.
 *
 * Ordered by the number rather than by the name, because the whole run shares one transaction
 * and therefore one `now()` — every file applied together carries the same timestamp, so
 * `applied` cannot break the tie.
 */
export const currentSchemaVersion = async (): Promise<SchemaVersion | undefined> => {
  try {
    const result = await query<SchemaVersion>({
      text: `SELECT name, applied FROM schema_migration
              ORDER BY split_part(name, '-', 1)::int DESC
              LIMIT 1`,
    })
    return result.rows[0]
  } catch (e) {
    // 42P01 is undefined_table: this database has never been migrated. Anything else is a real
    // database problem and belongs on screen as one.
    if (e !== null && typeof e === 'object' && 'code' in e && e.code === '42P01') {
      return undefined
    }
    throw e
  }
}
