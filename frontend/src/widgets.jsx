import React from 'react';

import './widgets.scss';
import '../css/_util.scss';

const CheckBox = props => (
  <button onClick={props.checkCb} className="normalize-button"><i className={props.checked ? 'fa fa-check-square-o' : 'fa fa-square-o'} /></button>
);
CheckBox.propTypes = {
  checkCb: React.PropTypes.func,
  checked: React.PropTypes.bool.isRequired,
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
  text: React.PropTypes.string,
  isLoading: React.PropTypes.bool,
  onClick: React.PropTypes.func,
  disabled: React.PropTypes.bool,
  className: React.PropTypes.string,
};

export { CheckBox, PrimaryButton };
