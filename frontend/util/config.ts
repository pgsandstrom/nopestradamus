import fs from 'fs'

const dbconfigPath = '/apps/nopestradamus/config.json'
const dbconfigDevPath = 'config.dev.json'

const privateKeyPath = '/apps/nopestradamus/backend/privkey.pem'

export const getPrivateKey = () => fs.readFileSync(privateKeyPath, 'utf8')

interface MyConfig {
  adminPassword: string
}

let config: MyConfig

const loadConfig = (): void => {
  if (fs.existsSync(dbconfigPath)) {
    config = JSON.parse(fs.readFileSync(dbconfigPath, 'utf8')) as MyConfig
  } else {
    // TODO fix
    // config = JSON.parse(fs.readFileSync(dbconfigDevPath, 'utf8')) as MyConfig
    config = {
      adminPassword: 'abc',
    }
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
