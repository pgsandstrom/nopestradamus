import { ERROR_RAISED, ERROR_DISMISSED } from './constants';

const initialState = {
  dropdownVisible: true,
  selectedConstantInfoSection: 0,
  orderLoading: false,
  order: null,
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ERROR_RAISED:
      return { ...state, error: action.payload };
    case ERROR_DISMISSED:
      return { ...state, error: null };
    default:
      return { ...state };
  }
};
