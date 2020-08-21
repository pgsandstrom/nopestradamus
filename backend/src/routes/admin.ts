import { Request, Response, Next, Server } from 'restify'

import config from '../util/config'
import { getError } from '../util/genericError'
import { handleAllUnsentMails } from '../controller/scheduler'
import { sendMail } from '../controller/mailer'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

const adminPassword = config().adminPassword

// TODO either enable password or just disable this in prod...
export default (server: Server) => {
  server.post('/api/v1/admin/checkmail', async (req: Request, res: Response, next: Next) => {
    try {
      const body = JSON.parse(req.body)

      if (adminPassword !== body.password) {
        throw new Error('Wrong admin password')
      }

      await handleAllUnsentMails()
      res.send('ok')
      next()
    } catch (e) {
      next(getError(e))
    }
  })

  server.post('/api/v1/admin/sendmail', async (req: Request, res: Response, next: Next) => {
    try {
      const body = JSON.parse(req.body)

      if (adminPassword !== body.password) {
        throw new Error('Wrong admin password')
      }

      await sendMail(body.mail, body.title, body.body)
      res.send('ok')
      next()
    } catch (e) {
      next(getError(e))
    }
  })
}
