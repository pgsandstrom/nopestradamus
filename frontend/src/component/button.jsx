import React from 'react';
import PropTypes from 'prop-types';

import './button.scss';

const Button = props => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    className={`${props.className || ''} normalize-button primary-button`}
  >{props.text}{props.isLoading && <span className="primary-button-loading"><span className="fa fa-spinner fa-spin" /></span>}
  </button>
);
Button.propTypes = {
  text: PropTypes.string,
  isLoading: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export { Button };
