import * as fs from 'fs';
import { isProdServer, isTestServer } from './env';
var dbconfigPath = '/apps/nopestradamus/config.json';
var dbconfigDevPath = 'config.dev.json';
var privateKeyPath = '/apps/nopestradamus/backend/privkey.pem';
export var getPrivateKey = function () { return fs.readFileSync(privateKeyPath, 'utf8'); };
var config;
var loadConfig = function () {
    if (fs.existsSync(dbconfigPath)) {
        config = JSON.parse(fs.readFileSync(dbconfigPath, 'utf8'));
    }
    else {
        if (isProdServer() || isTestServer()) {
            throw new Error('config file not found');
        }
        config = JSON.parse(fs.readFileSync(dbconfigDevPath, 'utf8'));
    }
};
export default (function () {
    if (config == null) {
        loadConfig();
    }
    return config;
});
//# sourceMappingURL=config.js.map