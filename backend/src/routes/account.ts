import { Request, Response, Next, Server } from 'restify'
import { getAccountByHash, setAccountBlocked } from '../controller/account'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export default (server: Server) => {
  server.get('/api/v1/account/:hash', async (req: Request, res: Response, next: Next) => {
    try {
      const hash = req.params.hash as string

      const account = await getAccountByHash(hash)
      res.send(account)
      next()
    } catch (e) {
      console.log(`admin checkmail threw error: ${JSON.stringify(e)}`)
      next(e)
    }
  })

  server.post('/api/v1/account/:hash/block', async (req: Request, res: Response, next: Next) => {
    try {
      const hash = req.params.hash as string

      const body = JSON.parse(req.body)

      const blocked = body.blocked as boolean

      await setAccountBlocked(hash, blocked)
      res.send('ok')
      next()
    } catch (e) {
      next(e)
    }
  })
}
