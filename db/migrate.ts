/**
 * Applies the SQL files in migrations/ that this database has not seen yet.
 *
 * It lives beside them rather than in server/ because it belongs to neither runtime process:
 * it runs as its own container, ahead of both, and it is the only code that reads those files.
 * Run through scripts/migrate.ts — the `migrate` compose service in production, `pnpm migrate`
 * locally.
 *
 * Rules, for whoever adds the next one:
 *
 *   - Files are named NNN-what-it-does.sql and applied in numeric order.
 *   - An applied file is frozen. Its checksum is stored, and editing it afterwards is an
 *     error rather than a silent divergence between this machine and production. To change
 *     something, add another migration.
 *   - The whole run is one transaction. Postgres has transactional DDL, so a failure rolls
 *     back every statement in every pending file and the database stays on the last version
 *     that fully worked — no half-migrated state to repair by hand.
 */
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { SQL, transaction } from '../util/db.ts'

const MIGRATIONS_DIR = path.join(import.meta.dirname, 'migrations')

// Arbitrary but fixed: two runs agreeing on the same number is the whole point.
const LOCK_KEY = 8074312

interface Migration {
  name: string
  sql: string
  checksum: string
}

/**
 * Validates the file names and puts them in the order they must be applied in. Sorted by the
 * number rather than as text, so the day the numbering reaches four digits nothing silently
 * reorders itself.
 */
export const orderMigrations = (fileNames: string[]): string[] => {
  const numbered = fileNames
    .filter((name) => name.endsWith('.sql'))
    .map((name) => {
      const match = /^(\d{3,})-[a-z0-9-]+\.sql$/.exec(name)
      if (!match) {
        throw new Error(`migration must be named like 002-add-prediction-index.sql, found: ${name}`)
      }
      return { name, number: Number(match[1]) }
    })
    .sort((a, b) => a.number - b.number)

  numbered.forEach((entry, i) => {
    const previous = numbered[i - 1]
    if (previous && previous.number === entry.number) {
      throw new Error(`two migrations share a number: ${previous.name} and ${entry.name}`)
    }
  })

  return numbered.map((entry) => entry.name)
}

// Line endings are normalised first, so a checkout that lands CRLF on one machine does not make
// every migration look edited on the next.
const checksumOf = (sql: string): string =>
  createHash('md5').update(sql.replace(/\r\n/g, '\n')).digest('hex')

const readMigrations = async (): Promise<Migration[]> => {
  const names = orderMigrations(await readdir(MIGRATIONS_DIR))
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(path.join(MIGRATIONS_DIR, name), 'utf8')
      return { name, sql, checksum: checksumOf(sql) }
    }),
  )
}

export const migrate = async (): Promise<void> => {
  const migrations = await readMigrations()

  await transaction(async (tx) => {
    // The frontend and the cron container come up together and a release can overlap with
    // containers from the previous one, so only one process gets to migrate. The xact variant
    // releases itself on commit or rollback, so a crash never leaves the lock held.
    await tx(SQL`SELECT pg_advisory_xact_lock(${LOCK_KEY}::bigint)`)

    await tx({
      text: `CREATE TABLE IF NOT EXISTS schema_migration (
               name     TEXT PRIMARY KEY,
               checksum TEXT      NOT NULL,
               applied  TIMESTAMP NOT NULL DEFAULT now()
             )`,
    })

    const appliedRows = await tx<{ name: string; checksum: string }>({
      text: 'SELECT name, checksum FROM schema_migration',
    })
    const appliedChecksums = new Map(appliedRows.rows.map((row) => [row.name, row.checksum]))

    const onDisk = new Set(migrations.map((migration) => migration.name))
    for (const name of appliedChecksums.keys()) {
      if (!onDisk.has(name)) {
        throw new Error(
          `${name} is applied to this database but is not in db/migrations. ` +
            `Either the checkout is older than the database (clone-prod-db does that) or the ` +
            `file was deleted, which is not how a migration is undone.`,
        )
      }
    }

    let appliedNow = 0
    for (const migration of migrations) {
      const previousChecksum = appliedChecksums.get(migration.name)
      if (previousChecksum !== undefined) {
        if (previousChecksum !== migration.checksum) {
          throw new Error(
            `${migration.name} has changed since it was applied to this database. ` +
              `An applied migration is frozen — add a new one instead of editing it.`,
          )
        }
        continue
      }

      console.log(`applying ${migration.name}`)
      // No values, so pg uses the simple query protocol and a file may hold several statements.
      await tx({ text: migration.sql })
      await tx(
        SQL`INSERT INTO schema_migration (name, checksum) VALUES (${migration.name}, ${migration.checksum})`,
      )
      appliedNow++
    }

    console.log(
      appliedNow === 0
        ? `database is up to date (${migrations.length} migrations applied)`
        : `applied ${appliedNow} migration${appliedNow === 1 ? '' : 's'}`,
    )
  })
}
