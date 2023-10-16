import { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../util/config'
import { sendMail } from '../../../server/mailer'

const adminPassword = config().adminPassword

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body)

  if (adminPassword !== body.password) {
    throw new Error('Wrong admin password')
  }

  await sendMail(body.mail, body.title, body.body)

  res.statusCode = 200
  res.json({ status: 'ok' })
}
