import { NextApiRequest, NextApiResponse } from 'next'
import { createPrediction } from '../../server/prediction'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body)
  try {
    await createPrediction(
      body.title,
      body.body,
      body.finishDate,
      body.isPublic,
      body.creater,
      body.participantList,
    )
    res.statusCode = 200
    res.json({ status: 'ok' })
  } catch (e) {
    res.statusCode = 500
    res.json({ status: JSON.stringify(e) })
  }
}
