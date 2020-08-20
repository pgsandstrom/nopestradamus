import cron from 'cron'
import { handleAllUnsentMails } from './scheduler'

export const startCronStuff = () => {
  const cronJob = new cron.CronJob('0 0 * * * *', async () => {
    try {
      await handleAllUnsentMails()
    } catch (e) {
      console.error(`Cron job threw error: ${JSON.stringify(e)}`)
      throw e
    }
  })
  cronJob.start()
  console.log('Cron jobs initiated')
}
