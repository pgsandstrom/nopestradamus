import { NextApiRequest, NextApiResponse } from 'next'
import { setAccountBlocked } from '../../../../server/account'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const hash = req.query.hash as string

  const body = JSON.parse(req.body as string)

  const blocked = body.blocked as boolean

  await setAccountBlocked(hash, blocked)

  res.statusCode = 200
  res.json({ status: 'ok' })
}
