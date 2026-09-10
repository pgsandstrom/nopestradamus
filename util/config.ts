import fs from 'node:fs'

const CONFIG_PATH = './config.json'
const PRIVATE_KEY_PATH = './privkey.pem'

// to find the config file, just check config.json in the project folder on the server
export interface AppConfig {
  adminPassword: string
}

let cachedConfig: AppConfig | undefined

/**
 * Reads config.json from the working directory. Lazy on purpose: the file only has to exist
 * when something actually needs it, so `next build` works without secrets present.
 */
export function getConfig(): AppConfig {
  if (cachedConfig === undefined) {
    if (!fs.existsSync(CONFIG_PATH)) {
      throw new Error(`No config file exists at ${CONFIG_PATH}`)
    }
    cachedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) as AppConfig
  }
  return cachedConfig
}

export const getPrivateKey = (): string => fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')
