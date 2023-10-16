export const isDev = () => isProd() === false

export const isProd = () => {
  return process.env.NODE_ENV === 'production'
}
