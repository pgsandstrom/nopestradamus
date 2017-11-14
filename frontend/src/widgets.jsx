import React from 'react';
import PropTypes from 'prop-types';

import './widgets.scss';
import '../css/_util.scss';

const CheckBox = props => (
  <button onClick={props.checkCb} className="normalize-button"><i className={props.checked ? 'fa fa-check-square-o' : 'fa fa-square-o'} /></button>
);
CheckBox.propTypes = {
  checkCb: PropTypes.func,
  checked: PropTypes.bool.isRequired,
};

const PrimaryButton = props => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    className={`${props.className || ''} normalize-button primary-button`}
  >{props.text}{props.isLoading && <span className="primary-button-loading"><span className="fa fa-spinner fa-spin" /></span>}
  </button>
);
PrimaryButton.propTypes = {
  text: PropTypes.string,
  isLoading: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export { CheckBox, PrimaryButton };
