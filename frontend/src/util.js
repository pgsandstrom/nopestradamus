import { getServerUrl } from './backend';
import { raiseError } from './global/actions';

const buildErrorMessage = (name, reason) => raiseError('Ett fel har inträffat', `${name} för retur kunde inte hämtas`, reason);

export const doFetch = (name, path, dispatch, options = { credentials: 'same-origin' }) => fetch(`${getServerUrl()}${path}`,
    options,
  ).then((response) => {
    if (response.ok) {
      return response.json().then((data) => {
        if (!data.error) {
          return Promise.resolve(data);
        } else {
          dispatch(buildErrorMessage(name, `${data.error}`));
          return Promise.reject();
        }
      }).catch((error) => {
        buildErrorMessage(name, `${name} svarade med felaktig json: ${error.message}`);
        dispatch((`${name} svarade med felaktig json: ${error.message}`));
        return Promise.reject();
      });
    } else {
      dispatch(buildErrorMessage(name, `${name} svar kunde inte hanteras\nStatus code: ${response.status}\nStatus text: ${response.statusText}`));
      return Promise.reject();
    }
  }).catch((error) => {
    dispatch(buildErrorMessage(`${name} fetch caught error: ${error.message}`));
    return Promise.reject();
  });

export const isUnsetValue = value => value === '' || value.length === 0 || Object.keys(value).length === 0;
