import restifyErrors from 'restify-errors';

restifyErrors.makeConstructor('GenericError', {
  statusCode: 500,
});

// eslint-disable-next-line import/prefer-default-export
export const getError = (data) => {
  if (data.stack) {
    // TODO this is a poor mans logging, we should do better...
    console.log(data.stack); // eslint-disable-line no-console
  }

  let info;
  if (typeof data === 'string' || data instanceof String) {
    info = getBodyFromString(data);
  } else if (data != null && data instanceof Object) {
    info = getBodyFromObject(data);
  }

  const error = new restifyErrors.GenericError({
    message: info.message,
    context: info,
  });
  error.statusCode = info.statusCode || 500;
  return error;
};

const getBodyFromString = string => ({
  message: string,
  code: 0,
  error: true,
});

const getBodyFromObject = object => ({
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
