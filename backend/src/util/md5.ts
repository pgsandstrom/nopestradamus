import crypto from 'crypto'

export default (str: string) => {
  const hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex')
}
