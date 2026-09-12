import fs from 'node:fs'

const CONFIG_PATH = './config.json'
const PRIVATE_KEY_PATH = './privkey.pem'

// to find the config file, just check config.json in the project folder on the server
export interface AppConfig {
  adminPassword: string
  /** Where the monthly health mail goes. Optional: without it the health job does nothing. */
  healthMailReceiver?: string
}

let cachedConfig: AppConfig | undefined

/**
 * Turns the file contents into an {@link AppConfig}, or throws saying what is wrong with it.
 *
 * Separate from {@link getConfig} so the unit test needs no file on disk, and it checks the
 * shape rather than trusting a cast: this file is hand-edited on the server, and a typo used to
 * surface as `Buffer.from(undefined)` deep inside the password check instead of as the config
 * being wrong.
 */
export function parseConfig(contents: string, path = CONFIG_PATH): AppConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(contents)
  } catch (e) {
    throw new Error(`${path} is not valid JSON: ${(e as Error).message}`, { cause: e })
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${path} must hold a JSON object, see config.example.json`)
  }

  const { adminPassword, healthMailReceiver } = parsed as Record<string, unknown>
  if (typeof adminPassword !== 'string' || adminPassword === '') {
    throw new Error(`${path} needs "adminPassword" to be a non-empty string`)
  }
  if (healthMailReceiver !== undefined && typeof healthMailReceiver !== 'string') {
    throw new Error(`${path} needs "healthMailReceiver" to be a string, or to leave the key out`)
  }

  return { adminPassword, healthMailReceiver }
}

/**
 * Reads config.json from the working directory. Lazy on purpose: the file only has to exist
 * when something actually needs it, so `next build` works without secrets present.
 */
export function getConfig(): AppConfig {
  if (cachedConfig === undefined) {
    if (!fs.existsSync(CONFIG_PATH)) {
      throw new Error(`No config file exists at ${CONFIG_PATH}`)
    }
    cachedConfig = parseConfig(fs.readFileSync(CONFIG_PATH, 'utf8'))
  }
  return cachedConfig
}

export const getPrivateKey = (): string => fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')
