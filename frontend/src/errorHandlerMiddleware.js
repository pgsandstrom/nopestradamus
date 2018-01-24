import { raiseError } from './global/actions';

export const errorHandlerMiddleware = store => next => (action) => {
  if (action.error && !(action.payload != null && action.payload.error === false) && (action.meta == null || !action.meta.ignoreError)) {
    if (action.payload) {
      if (action.payload instanceof Error) {
        store.dispatch(raiseError('Ett fel har inträffat', 'Ett okänt fel har inträffat', action.payload.message, 0));
      } else if (typeof action.payload === 'object') {
        const error = { // acceptable errors are placed in the payload or in payload.error
          ...action.payload.error || action.payload,
          name: action.payload.name || action.payload.error.name,
        };
        store.dispatch(raiseError('Ett fel har inträffat', `${error.name || 'Ett objekt '} kunde inte hämtas`, error.message, error.code));
      } else if (action.payload.name) {
        store.dispatch(raiseError('Ett fel har inträffat', `${action.payload.name} kunde inte hämtas`, action.payload.error, action.payload.code));
      }
    } else {
      store.dispatch(raiseError('Ett fel har inträffat', 'Ett okänt fel har inträffat', action.payload.message, 0));
    }
  }
  return next(action);
};

export const pending = constant => `${constant}_PENDING`;
export const fulfilled = constant => `${constant}_FULFILLED`;
export const rejected = constant => `${constant}_REJECTED`;
