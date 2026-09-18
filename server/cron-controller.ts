import { CronJob } from 'cron'

import { handleAllUnsentMails, sendHealthMail } from './scheduler.ts'
import { deleteExpiredSessions } from './session.ts'

const EVERY_HOUR = '0 0 * * * *'
// six fields, seconds first, like EVERY_HOUR: 05:00 on the first of every month
const FIRST_OF_EVERY_MONTH = '0 0 5 1 * *'
// the container runs UTC, so without this the health mail would drift an hour twice a year
const TIME_ZONE = 'Europe/Stockholm'

export const startCronStuff = (): void => {
  const cronJob = CronJob.from({
    cronTime: EVERY_HOUR,
    onTick: async () => {
      try {
        await handleAllUnsentMails()
      } catch (e) {
        console.error(`Cron job threw error: ${String(e)}`)
      }
      // housekeeping, not part of the gate: an expired session is already refused on read
      try {
        const removed = await deleteExpiredSessions()
        if (removed > 0) {
          console.log(`removed ${removed} expired sessions`)
        }
      } catch (e) {
        console.error(`Session sweep threw error: ${String(e)}`)
      }
    },
    start: true,
  })
  const healthJob = CronJob.from({
    cronTime: FIRST_OF_EVERY_MONTH,
    timeZone: TIME_ZONE,
    onTick: async () => {
      try {
        await sendHealthMail()
      } catch (e) {
        console.error(`Health mail job threw error: ${String(e)}`)
      }
    },
    start: true,
  })
  console.log(
    `Cron jobs initiated. Next run: ${cronJob.nextDate().toISO()}. ` +
      `Next health mail: ${healthJob.nextDate().toISO()}. NODE_ENV: "${process.env.NODE_ENV}"`,
  )
}
