import { Request, Response, Server } from 'restify'
import { getAccountByHash, setAccountBlocked } from '../controller/account'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export default (server: Server) => {
  server.get('/api/v1/account/:hash', async (req: Request, res: Response) => {
    try {
      const hash = req.params.hash as string

      const account = await getAccountByHash(hash)
      res.send(account)
    } catch (e) {
      console.log(`admin checkmail threw error: ${JSON.stringify(e)}`)
      throw e
    }
  })

  server.post('/api/v1/account/:hash/block', async (req: Request, res: Response) => {
    try {
      const hash = req.params.hash as string

      const body = JSON.parse(req.body as string)

      const blocked = body.blocked as boolean

      await setAccountBlocked(hash, blocked)
      res.send('ok')
    } catch (e) {
      throw e
    }
  })
}
