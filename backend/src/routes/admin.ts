import { Request, Response, Server } from 'restify'

import config from '../util/config'
import { handleAllUnsentMails } from '../controller/scheduler'
import { sendMail } from '../controller/mailer'
import { deletePrediction, getPrediction, getPredictions } from '../controller/prediction'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const adminPassword = config().adminPassword

export default (server: Server) => {
  server.post('/api/v1/admin/checkmail', async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body as string)

      if (adminPassword !== body.password) {
        throw new Error('Wrong admin password')
      }

      await handleAllUnsentMails()
      res.send('ok')
    } catch (e) {
      console.log(`admin checkmail threw error: ${JSON.stringify(e)}`)
      throw e
    }
  })

  server.post('/api/v1/admin/sendmail', async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body)

      if (adminPassword !== body.password) {
        throw new Error('Wrong admin password')
      }

      await sendMail(body.mail, body.title, body.body)
      res.send('ok')
    } catch (e) {
      throw e
    }
  })

  server.del('/api/v1/admin/deleteprediction', async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body)

      if (adminPassword !== body.password) {
        throw new Error('Wrong admin password')
      }

      const result = await deletePrediction(body.hash)
      res.send(result)
    } catch (e) {
      throw e
    }
  })

  server.del('/api/v1/admin/deletetest', async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body)

      if (adminPassword !== body.password) {
        throw new Error('Wrong admin password')
      }

      let deleted = 0

      const predictions = await getPredictions('test')
      for (const p of predictions) {
        const prediction = await getPrediction(p.hash)
        if (prediction.creater.mail === 'hello@persandstrom.com') {
          await deletePrediction(prediction.hash)
          deleted += 1
        }
      }

      res.send({ deleted })
    } catch (e) {
      console.log(JSON.stringify(e))
      throw e
    }
  })
}
