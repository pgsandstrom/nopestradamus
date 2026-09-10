import { CronJob } from 'cron'

import { handleAllUnsentMails } from './scheduler.ts'

const EVERY_HOUR = '0 0 * * * *'

export const startCronStuff = (): void => {
  const cronJob = CronJob.from({
    cronTime: EVERY_HOUR,
    onTick: async () => {
      try {
        await handleAllUnsentMails()
      } catch (e) {
        console.error(`Cron job threw error: ${String(e)}`)
      }
    },
    start: true,
  })
  console.log(
    `Cron jobs initiated. Next run: ${cronJob.nextDate().toISO()}. NODE_ENV: "${process.env.NODE_ENV}"`,
  )
}
