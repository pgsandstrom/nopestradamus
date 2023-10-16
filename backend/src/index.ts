import { Server, createServer, plugins } from 'restify'

import encodeUtf8Plugin from './util/encodeUtf8Plugin'
import routes from './routes/index'
import noCachePlugin from './util/noCachePlugin'

import { startCronStuff } from './controller/cronController'
import { isDev } from './util/env'

const server: Server = createServer()

server.use(plugins.acceptParser(server.acceptable))
server.use(plugins.queryParser())
server.use(plugins.bodyParser())
server.use(encodeUtf8Plugin())
server.use(noCachePlugin())

routes(server)

server.listen(3000, () => {
  console.log('%s listening at %s', server.name, server.url) // eslint-disable-line no-console
})

if (isDev()) {
  // handleAllUnsentMails().catch((e) => {
  //   console.error('dev failure to sent mails')
  //   throw e
  // })
} else {
  startCronStuff()
}
