import { NextApiRequest, NextApiResponse } from 'next'
import { createPrediction } from '../../server/prediction'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body)
  try {
    const result = await createPrediction(
      body.title,
      body.body,
      body.finishDate,
      body.isPublic,
      body.creater,
      body.participantList,
    )
    res.statusCode = 200
    res.json({ status: `ok. Result ${JSON.stringify(result)}` })
  } catch (e) {
    res.statusCode = 500
    res.json({ status: JSON.stringify(e) })
  }
}
