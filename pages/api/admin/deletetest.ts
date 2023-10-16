import { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../util/config'
import { deletePrediction, getPrediction, getPredictions } from '../../../server/prediction'

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

  let deleted = 0

  const predictions = await getPredictions('test')
  for (const p of predictions) {
    const prediction = await getPrediction(p.hash)
    if (prediction === undefined) {
      throw new Error(`Prediction not found: ${p.hash}`)
    }
    if (prediction.creater.mail === 'hello@persandstrom.com') {
      await deletePrediction(prediction.hash)
      deleted += 1
    }
  }

  res.send({ deleted })
}
