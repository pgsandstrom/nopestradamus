import { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../util/config'
import { sendMail } from '../../../server/mailer'

const adminPassword = config().adminPassword

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body)

  if (adminPassword !== body.password) {
    res.statusCode = 500
    res.json({ status: `Wrong admin password in body: ${req.body}` })
    return
  }

  await sendMail(body.mail, body.title, body.body)

  res.statusCode = 200
  res.json({ status: 'ok' })
}
