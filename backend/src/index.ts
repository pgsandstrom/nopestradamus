import { createServer, plugins, Server } from 'restify'

import encodeUtf8Plugin from './util/encodeUtf8Plugin'
import routes from './routes/index'
import noCachePlugin from './util/noCachePlugin'
import config from './util/config'

import { handleAllUnsentMails } from './controller/scheduler'
import { startCronStuff } from './controller/cronController'
import { isDev } from './util/env'

const server: Server = createServer()

server.use(plugins.acceptParser(server.acceptable))
server.use(plugins.queryParser())
server.use(plugins.bodyParser())
server.use(encodeUtf8Plugin())
server.use(noCachePlugin())

routes(server)

// We customize restifys error messages to display more information
/* eslint-disable */
server.on('restifyError', (req, res, err: any, callback) => {
  if (err.name === 'GenericError') {
    // eslint-disable-next-line no-param-reassign
    err.toJSON = function customToJSON() {
      return {
        ...err.context,
      }
    }
  }
  return callback()
})
/* eslint-enable */

server.listen(config().port, () => {
  console.log('%s listening at %s', server.name, server.url) // eslint-disable-line no-console
})

if (isDev()) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  handleAllUnsentMails()
} else {
  startCronStuff()
}
