import cron from 'cron'
import { handleAllUnsentMails } from './scheduler'

export const startCronStuff = () => {
  const cronJob = new cron.CronJob('0 0 * * * *', async () => {
    try {
      await handleAllUnsentMails()
      console.log('Cron job completed')
    } catch (e) {
      console.error(`Cron job threw error: ${e}`)
      throw e
    }
  })
  cronJob.start()
}
