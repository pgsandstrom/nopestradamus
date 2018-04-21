import {InternalServerError, makeConstructor} from 'restify-errors';

interface Info {
  message: string
  code: number
  error: boolean,
  statusCode?: number,
  extraInfo?: any,
}

makeConstructor('GenericError', {
  statusCode: 500,
});

// eslint-disable-next-line import/prefer-default-export
export const getError = (data:any) => {
  if (data.stack) {
    // TODO this is a poor mans logging, we should do better...
    console.log(data.stack); // eslint-disable-line no-console
  }

  let info;
  if (typeof data === 'string' || data instanceof String) {
    info = getBodyFromString(data as string);
  } else if (data != null && data instanceof Object) {
    info = getBodyFromObject(data);
  }

  const error = new InternalServerError({
    message: info.message,
    context: info,
  });
  error.statusCode = info.statusCode || 500;
  return error;
};

const getBodyFromString = (string:string):Info => ({
  message: string,
  code: 0,
  error: true,
});

const getBodyFromObject = (object:any) => ({
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
});
