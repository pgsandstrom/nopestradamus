import { NextApiRequest, NextApiResponse } from 'next'
import {
  updateCreaterAcceptStatus,
  updateParticipantAcceptStatus,
} from '../../../../../../server/prediction'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const predictionHash = req.query.prediction as string
  const role = req.query.role as string
  const hash = req.query.roleHash as string
  const answer = req.query.answer as string

  if (role === 'creater') {
    if (answer === 'accept') {
      await updateCreaterAcceptStatus(predictionHash, hash, true)
    } else if (answer === 'deny') {
      await updateCreaterAcceptStatus(predictionHash, hash, false)
    } else {
      throw new Error(`Unknown answer: "${answer}"`)
    }
  } else if (role === 'participant') {
    if (answer === 'accept') {
      await updateParticipantAcceptStatus(predictionHash, hash, true)
    } else if (answer === 'deny') {
      await updateParticipantAcceptStatus(predictionHash, hash, false)
    } else {
      throw new Error(`Unknown answer: "${answer}"`)
    }
  }

  res.statusCode = 200
  res.json({ status: 'ok' })
}
