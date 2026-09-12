/**
 * Sends the monthly health mail right now, so the cron job can be verified without waiting for
 * the first of the month.
 *
 * Locally sendMail only logs, so this proves the queries and the body but posts nothing. To send
 * a real mail, run it in the production cron container, which has postfix, privkey.pem and the
 * database on its network:
 *
 *   docker compose exec cron node scripts/send-health-mail.ts
 */
import { sendHealthMail } from '../server/scheduler.ts'

await sendHealthMail()
console.log('done')
// the pg pool keeps the event loop alive, so leaving is explicit
process.exit(0)
