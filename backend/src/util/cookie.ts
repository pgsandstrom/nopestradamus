import { Request } from 'restify'

export const getCookieValue = (request: Request, name: string): string | undefined => {
  if (request.headers.cookie !== undefined) {
    let cookieArray
    if (typeof request.headers.cookie === 'string') {
      const cookieString = request.headers.cookie
      cookieArray = cookieString.split(';')
    } else {
      cookieArray = request.headers.cookie as string[]
    }
    const cookie = cookieArray.find((header) => header.trim().startsWith(`${name}=`))
    if (cookie !== undefined) {
      return cookie.substring(cookie.indexOf('=') + 1)
    }
  }
  return undefined
}
