import { ERROR_RAISED, ERROR_DISMISSED } from './constants';

export const raiseError = (title, body, technicalError) => ({
  type: ERROR_RAISED,
  payload: {
    title,
    body,
    technicalError,
  },
});

export const dismissError = () => ({
  type: ERROR_DISMISSED,
});
