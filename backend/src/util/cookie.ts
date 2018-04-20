import {Request} from "restify"

// eslint-disable-next-line import/prefer-default-export
export const getCookie = (request: Request, name:string) => {
  if (request.headers.cookie) {
    let cookieArray;
    if(typeof request.headers.cookie === "string" ) {
      const cookieString = request.headers.cookie as string
      cookieArray = cookieString.split(';')
    } else {
      cookieArray = request.headers.cookie as string[]
    }
    const cookie = cookieArray.find(header => header.trim().startsWith(`${name}=`))
    if (cookie != null) {
      return cookie.substring(cookie.indexOf('=') + 1)
    }
  }
  return null
}
