import { Next, Request, Response, Server } from 'restify'
import prediction from './prediction'
import account from './account'
import admin from './admin'

export default (server: Server) => {
  prediction(server)
  account(server)
  admin(server)

  server.get('/api/v1', (req: Request, res: Response, next: Next) => {
    res.send('hello')
    next()
  })
}
