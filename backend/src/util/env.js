const PROD_ENV = 'PROD_ENV';
// const DEV_ENV = 'DEV_ENV';

export const NODE_ENV_PRODUCTION = 'production';
export const NODE_ENV_DEV = 'development';

const isProduction = () => {
  if (process.env.NODE_ENV !== NODE_ENV_PRODUCTION && process.env.NODE_ENV !== NODE_ENV_DEV) {
    throw new Error(`invalid NODE_ENV: ${process.env.NODE_ENV}`);
  }
  return process.env.NODE_ENV === 'production';
};

export const isProdServer = () => isProduction() && isEnvVariableTrue(PROD_ENV);

export const isTestServer = () => isProduction() && isProdServer() === false;

const isEnvVariableTrue = envVariable => process.env[envVariable] != null && process.env[envVariable].toLowerCase() === 'true';
