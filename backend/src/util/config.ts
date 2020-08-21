import fs from 'fs'

import { isProdServer, isTestServer } from './env'

const dbconfigPath = '/apps/nopestradamus/config.json'
const dbconfigDevPath = 'config.dev.json'

const privateKeyPath = '/apps/nopestradamus/backend/privkey.pem'

export const getPrivateKey = () => fs.readFileSync(privateKeyPath, 'utf8')

interface MyConfig {
  database: {
    host: string
    user: string
    database: string
    password: string
  }
  adminPassword: string
  port: string
}

let config: MyConfig

const loadConfig = () => {
  if (fs.existsSync(dbconfigPath)) {
    config = JSON.parse(fs.readFileSync(dbconfigPath, 'utf8')) as MyConfig
  } else {
    if (isProdServer() || isTestServer()) {
      throw new Error('config file not found')
    }
    config = JSON.parse(fs.readFileSync(dbconfigDevPath, 'utf8')) as MyConfig
  }
}

export default () => {
  // TODO would it be possible to use loadConfig as a type guard to make 'config' variable into defined.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (config === undefined) {
    loadConfig()
  }
  return config
}
