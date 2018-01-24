import { ERROR_RAISED, ERROR_DISMISSED } from './reducer';

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
