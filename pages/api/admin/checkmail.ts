import { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../util/config'
import { handleAllUnsentMails } from '../../../server/scheduler'

const adminPassword = config().adminPassword

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body as string)

  if (adminPassword !== body.password) {
    res.statusCode = 500
    res.json({ status: `Wrong admin password in body: ${req.body}` })
    return
  }

  await handleAllUnsentMails()

  res.statusCode = 200
  res.json({ status: 'ok' })
}
