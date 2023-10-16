import { Request, Response, Server } from 'restify'

import {
  createPrediction,
  getCensoredPrediction,
  getLatestPredictions,
  getPrediction,
  updateCreaterAcceptStatus,
  updateParticipantAcceptStatus,
} from '../controller/prediction'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

export default (server: Server) => {
  // get the latest predictions
  // server.get('/api/v1/prediction', async (req: Request, res: Response) => {
  //   try {
  //     const predictions = await getLatestPredictions()
  //     res.send(predictions)
  //   } catch (e) {
  //     throw e
  //   }
  // })
  // server.get('/api/v1/prediction/:hash', async (req: Request, res: Response) => {
  //   try {
  //     const hash = req.params.hash
  //     const prediction = await getPrediction(hash)
  //     const censoredPrediction = getCensoredPrediction(prediction)
  //     res.send(censoredPrediction)
  //   } catch (e) {
  //     throw e
  //   }
  // })
  // // this is used to see which participant you are in the predicition
  // server.get(
  //   '/api/v1/prediction/:prediction/participant/:hash',
  //   async (req: Request, res: Response) => {
  //     try {
  //       const predictionHash = req.params.prediction as string
  //       const participantHash = req.params.hash as string
  //       const prediction = await getPrediction(predictionHash)
  //       const censoredPrediction = getCensoredPrediction(prediction, participantHash)
  //       res.send(censoredPrediction)
  //     } catch (e) {
  //       throw e
  //     }
  //   },
  // )
  // server.put('/api/v1/prediction', async (req: Request, res: Response) => {
  //   const body = JSON.parse(req.body)
  //   try {
  //     await createPrediction(
  //       body.title,
  //       body.body,
  //       body.finishDate,
  //       body.isPublic,
  //       body.creater,
  //       body.participantList,
  //     )
  //     res.send('ok')
  //   } catch (e) {
  //     throw e
  //   }
  // })
  // server.post(
  //   '/api/v1/prediction/:prediction/creater/:hash/accept',
  //   async (req: Request, res: Response) => {
  //     const predictionHash = req.params.prediction
  //     const hash = req.params.hash
  //     try {
  //       await updateCreaterAcceptStatus(predictionHash, hash, true)
  //       // TODO throw error if miss
  //       res.send('ok')
  //     } catch (e) {
  //       throw e
  //     }
  //   },
  // )
  // server.post(
  //   '/api/v1/prediction/:prediction/creater/:hash/deny',
  //   async (req: Request, res: Response) => {
  //     const predictionHash = req.params.prediction
  //     const hash = req.params.hash
  //     try {
  //       await updateCreaterAcceptStatus(predictionHash, hash, false)
  //       // TODO throw error if miss
  //       res.send('ok')
  //     } catch (e) {
  //       throw e
  //     }
  //   },
  // )
  // server.post(
  //   '/api/v1/prediction/:prediction/participant/:hash/accept',
  //   async (req: Request, res: Response) => {
  //     const predictionHash = req.params.prediction
  //     const hash = req.params.hash
  //     try {
  //       await updateParticipantAcceptStatus(predictionHash, hash, true)
  //       // TODO throw error if miss
  //       res.send('ok')
  //     } catch (e) {
  //       throw e
  //     }
  //   },
  // )
  // server.post(
  //   '/api/v1/prediction/:prediction/participant/:hash/deny',
  //   async (req: Request, res: Response) => {
  //     const predictionHash = req.params.prediction
  //     const hash = req.params.hash
  //     try {
  //       await updateParticipantAcceptStatus(predictionHash, hash, false)
  //       // TODO throw error if miss
  //       res.send('ok')
  //     } catch (e) {
  //       throw e
  //     }
  //   },
  // )
}
