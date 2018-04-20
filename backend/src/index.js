var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import 'babel-polyfill';
import * as restify from 'restify';
import encodeUtf8Plugin from './util/encodeUtf8Plugin';
import routes from './routes/index';
import noCachePlugin from './util/noCachePlugin';
import config from './util/config';
import { init as schedulerInit } from './controller/scheduler';
var server = restify.createServer();
var plugins = restify.plugins;
server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser());
server.use(encodeUtf8Plugin());
server.use(noCachePlugin());
routes(server);
server.on('restifyError', function (req, res, err, callback) {
    if (err.name === 'GenericError') {
        err.toJSON = function customToJSON() {
            return __assign({}, err.context);
        };
    }
    return callback();
});
server.listen(config().port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
schedulerInit();
//# sourceMappingURL=index.js.map