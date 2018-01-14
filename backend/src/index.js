// polyfill in async-await. Needed for production.
import 'babel-polyfill';

import restify from 'restify';

import encodeUtf8Plugin from './util/encodeUtf8Plugin';
import routes from './routes';
import noCachePlugin from './util/noCachePlugin';
import config from './util/config';

import { init as schedulerInit } from './controller/scheduler';
import { sendMail } from './controller/mailer';

const server = restify.createServer();

const { plugins } = restify;

server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser());
server.use(encodeUtf8Plugin());
server.use(noCachePlugin());

routes(server);

// We customize restifys error messages to display more information
server.on('restifyError', (req, res, err, callback) => {
  if (err.name === 'GenericError') {
    // eslint-disable-next-line no-param-reassign
    err.toJSON = function customToJSON() {
      return {
        ...err.context,
      };
    };
  }
  return callback();
});

const port = config().port;
server.listen(port, () => {
  console.log('%s listening at %s', server.name, server.url); // eslint-disable-line no-console
});

schedulerInit();
sendMail();

