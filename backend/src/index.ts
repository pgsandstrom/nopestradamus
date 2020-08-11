import { createServer, plugins, Server } from 'restify'

import encodeUtf8Plugin from './util/encodeUtf8Plugin'
import routes from './routes/index'
import noCachePlugin from './util/noCachePlugin'
import config from './util/config'

import { init as schedulerInit } from './controller/scheduler'

const server: Server = createServer()

server.use(plugins.acceptParser(server.acceptable))
server.use(plugins.queryParser())
server.use(plugins.bodyParser())
server.use(encodeUtf8Plugin())
server.use(noCachePlugin())

routes(server)

// We customize restifys error messages to display more information
server.on('restifyError', (req, res, err, callback) => {
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

server.listen(config().port, () => {
  console.log('%s listening at %s', server.name, server.url) // eslint-disable-line no-console
})

schedulerInit()
