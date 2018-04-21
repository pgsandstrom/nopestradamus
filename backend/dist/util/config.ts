import * as fs from 'fs';

import { isProdServer, isTestServer } from './env';

const dbconfigPath = '/apps/nopestradamus/config.json';
const dbconfigDevPath = 'config.dev.json';

const privateKeyPath = '/apps/nopestradamus/backend/privkey.pem';

export const getPrivateKey = () => fs.readFileSync(privateKeyPath, 'utf8');

let config: any;
const loadConfig = () => {
  if (fs.existsSync(dbconfigPath)) {
    config = JSON.parse(fs.readFileSync(dbconfigPath, 'utf8'));
  } else {
    if (isProdServer() || isTestServer()) {
      throw new Error('config file not found');
    }
    config = JSON.parse(fs.readFileSync(dbconfigDevPath, 'utf8'));
  }
};

export default () => {
  if (config == null) {
    loadConfig();
  }
  return config;
};
