import { Next, Request, Response } from 'restify'

export default () => (req: Request, res: Response, next: Next) => {
  res.charSet('utf8')
  next()
}
