import { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../util/config'
import { handleAllUnsentMails } from '../../../server/scheduler'

const adminPassword = config().adminPassword

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body as string)

  if (adminPassword !== body.password) {
    throw new Error('Wrong admin password')
  }

  await handleAllUnsentMails()

  res.statusCode = 200
  res.json({ status: 'ok' })
}
