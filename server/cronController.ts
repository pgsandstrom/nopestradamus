import cron from 'cron'
import { handleAllUnsentMails } from './scheduler'

export const startCronStuff = () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const cronJob = new cron.CronJob('0 0 * * * *', async () => {
    try {
      await handleAllUnsentMails()
    } catch (e) {
      console.error(`Cron job threw error: ${JSON.stringify(e)}`)
      throw e
    }
  })
  cronJob.start()
  console.log(`Cron jobs initiated. process.env.NODE_ENV: "${process.env.NODE_ENV}"`)
}
