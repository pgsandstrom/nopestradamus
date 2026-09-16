/**
 * Applies any pending migrations in db/migrations, then exits.
 *
 * In production this is the one-shot `migrate` compose service, which the frontend and cron
 * services wait to finish, so a release that cannot migrate fails before any app code reaches
 * the new schema. Locally `pnpm migrate` runs the same thing against the dev database, and
 * `pnpm dev-database` runs it for you once postgres is healthy.
 */
import { migrate } from '../db/migrate.ts'

try {
  await migrate()
} catch (e) {
  // Stack first and the reason last: this usually gets read as the final lines of a failed
  // release, where the message is what matters and the stack is only there if it doesn't.
  console.error(e)
  console.error(
    `\nmigration failed, the database was left untouched: ${e instanceof Error ? e.message : e}`,
  )
  process.exit(1)
}
process.exit(0)
