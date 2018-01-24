import { GET_LATEST_PREDICTIONS } from './reducer';
import { doFetch } from '../util';

export const getLatestPredictions = () => (dispatch) => {
  dispatch({
    type: GET_LATEST_PREDICTIONS,
    payload: doFetch('getLatestPredictions', '/api/v1/prediction', dispatch),
  });
};

