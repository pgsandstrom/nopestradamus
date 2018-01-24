import { fulfilled } from '../errorHandlerMiddleware';

export const GET_LATEST_PREDICTIONS = 'prediction/GET_LATEST_PREDICTIONS';

const initialState = {
  latestPredictions: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case fulfilled(GET_LATEST_PREDICTIONS):
      return { ...state, latestPredictions: action.payload };
    default:
      return { ...state };
  }
};
