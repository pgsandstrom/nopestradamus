import { InternalServerError, makeConstructor, UnauthorizedError } from 'restify-errors'

// XXX this code feel fugly

interface Info {
  message: string
  code: number
  error: boolean
  statusCode?: number
  extraInfo?: any
}

makeConstructor('GenericError', {
  statusCode: 500,
})

export const AUTH_ERROR = 'AUTH_ERROR'

export const getError = (data: any) => {
  if (data instanceof Error && (data as Error).message === AUTH_ERROR) {
    return new UnauthorizedError('pls')
  }

  if (data.stack) {
    console.error(data.stack)
  }

  let info: Info
  if (data instanceof Error) {
    info = getBodyFromError(data as Error)
  } else if (typeof data === 'string' || data instanceof String) {
    info = getBodyFromString(data as string)
  } else if (data != null && data instanceof Object) {
    info = getBodyFromObject(data)
  }

  const error = new InternalServerError(
    {
      message: info!.message,
      context: info!,
    },
    info!.message,
  )
  error.statusCode = info!.statusCode || 500
  return error
}

const getBodyFromError = (e: Error): Info => ({
  message: e.message,
  code: 0,
  error: true,
})

const getBodyFromString = (message: string): Info => ({
  message,
  code: 0,
  error: true,
})

const getBodyFromObject = (object: any) => ({
  message: object.message,
  code: object.code || 0,
  error: true,
  statusCode: object.statusCode,
  extraInfo: {
    ...object,
    message: undefined,
    code: undefined,
    statusCode: undefined,
    error: undefined,
  },
})
