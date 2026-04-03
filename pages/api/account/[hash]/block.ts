import { NextApiRequest, NextApiResponse } from 'next'
import { setAccountBlocked } from '../../../../server/account'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const hash = req.query.hash as string

  let blocked = true
  try {
    const body = JSON.parse(req.body as string)
    blocked = body.blocked as boolean
  } catch {
    // Default to blocking (e.g. List-Unsubscribe one-click POST)
  }

  await setAccountBlocked(hash, blocked)

  res.statusCode = 200
  res.json({ status: 'ok' })
}
