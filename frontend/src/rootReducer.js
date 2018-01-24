import { combineReducers } from 'redux';

import global from './global/reducer';
import prediction from './prediction/reducer';

const rootReducer = combineReducers({
  global,
  prediction,
});

export default rootReducer;
