const PROD_ENV = 'PROD_ENV'

export const NODE_ENV_PRODUCTION = 'production'
export const NODE_ENV_DEV = 'development'

// explanation:
// prod env means that we are using pm2-prod.json. This should only happen on the prod server.
// NODE_ENV_PRODUCTION on the other hand just means that it is a prod build. We use prod build both on prod server and test server.

export const isDev = () => isProdServer() === false && isTestServer() === false

const isProduction = () => {
  if (process.env.NODE_ENV !== NODE_ENV_PRODUCTION && process.env.NODE_ENV !== NODE_ENV_DEV) {
    throw new Error(`invalid NODE_ENV: ${process.env.NODE_ENV}`)
  }
  return process.env.NODE_ENV === 'production'
}

export const isProdServer = () => isProduction() && isEnvVariableTrue(PROD_ENV)

export const isTestServer = () => isProduction() && isProdServer() === false

const isEnvVariableTrue = (envVariable: string) =>
  process.env[envVariable] != null && process.env[envVariable]!.toLowerCase() === 'true'
