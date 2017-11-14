import { combineReducers } from 'redux';

import globalReducer from './global/reducer';

const rootReducer = combineReducers({
  globalReducer,
});

export default rootReducer;
