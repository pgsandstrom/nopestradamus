import { Request, Response, Next, Server } from 'restify'

import {
  getLatestPredictions,
  getPrediction,
  createPrediction,
  updateCreaterAcceptStatus,
  updateParticipantAcceptStatus,
  getCensoredPrediction,
} from '../controller/prediction'
import { getError } from '../util/genericError'

export default (server: Server) => {
  // get the latest predictions
  server.get('/api/v1/prediction', async (req: Request, res: Response, next: Next) => {
    try {
      const predictions = await getLatestPredictions()
      res.send(predictions)
      next()
    } catch (e) {
      next(getError(e))
    }
  })

  server.get('/api/v1/prediction/:hash', async (req: Request, res: Response, next: Next) => {
    try {
      const hash = req.params.hash
      const prediction = await getPrediction(hash)
      const censoredPrediction = getCensoredPrediction(prediction)
      res.send(censoredPrediction)
      next()
    } catch (e) {
      next(getError(e))
    }
  })

  // this is used to see which participant you are in the predicition
  server.get(
    '/api/v1/prediction/:prediction/participant/:hash',
    async (req: Request, res: Response, next: Next) => {
      try {
        const predictionHash = req.params.prediction as string
        const participantHash = req.params.hash as string
        const prediction = await getPrediction(predictionHash)
        const censoredPrediction = getCensoredPrediction(prediction, participantHash)
        res.send(censoredPrediction)
        next()
      } catch (e) {
        next(getError(e))
      }
    },
  )

  server.put('/api/v1/prediction', async (req: Request, res: Response, next: Next) => {
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
      res.send('ok')
      next()
    } catch (e) {
      next(getError(e))
    }
  })

  server.post(
    '/api/v1/prediction/:prediction/creater/:hash/accept',
    async (req: Request, res: Response, next: Next) => {
      const predictionHash = req.params.prediction
      const hash = req.params.hash
      try {
        await updateCreaterAcceptStatus(predictionHash, hash, true)
        res.send('ok')
        next()
      } catch (e) {
        next(getError(e))
      }
    },
  )

  server.post(
    '/api/v1/prediction/:prediction/creater/:hash/deny',
    async (req: Request, res: Response, next: Next) => {
      const predictionHash = req.params.prediction
      const hash = req.params.hash
      try {
        await updateCreaterAcceptStatus(predictionHash, hash, false)
        res.send('ok')
        next()
      } catch (e) {
        next(getError(e))
      }
    },
  )

  server.post(
    '/api/v1/prediction/:prediction/participant/:hash/accept/',
    async (req: Request, res: Response, next: Next) => {
      const predictionHash = req.params.prediction
      const hash = req.params.hash
      try {
        await updateParticipantAcceptStatus(predictionHash, hash, true)
        res.send('ok')
        next()
      } catch (e) {
        next(getError(e))
      }
    },
  )

  server.post(
    '/api/v1/prediction/:prediction/participant/:hash/deny/',
    async (req: Request, res: Response, next: Next) => {
      const predictionHash = req.params.prediction
      const hash = req.params.hash
      try {
        await updateParticipantAcceptStatus(predictionHash, hash, false)
        res.send('ok')
        next()
      } catch (e) {
        next(getError(e))
      }
    },
  )
}
