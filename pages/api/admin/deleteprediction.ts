import { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../util/config'
import { deletePrediction } from '../../../server/prediction'

const adminPassword = config().adminPassword

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'DELETE') {
    const body = JSON.parse(req.body)

    if (adminPassword !== body.password) {
      throw new Error('Wrong admin password')
    }

    const result = await deletePrediction(body.hash)

    res.statusCode = 200
    res.send(result)
  } else {
    throw 'wrong request'
  }
}
