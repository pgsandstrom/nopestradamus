import fs from 'fs'

const configPath = './config.json'

const privateKeyPath = './privkey.pem'

export const getPrivateKey = () => fs.readFileSync(privateKeyPath, 'utf8')

interface MyConfig {
  adminPassword: string
}

let config: MyConfig

const loadConfig = (): void => {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as MyConfig
  } else {
    throw new Error('no config file exists')
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
