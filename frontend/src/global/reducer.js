export const ERROR_RAISED = 'ERROR_RAISED';
export const ERROR_DISMISSED = 'ERROR_DISMISSED';

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
