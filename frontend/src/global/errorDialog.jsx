import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { dismissError } from './actions';

import './errorDialog.scss';

const ErrorDialog = (props) => {
  if (!props || (!props.error)) {
    return null;
  }

  let technicalError;
  if (props.error.technicalError != null && typeof props.error.technicalError === 'object') {
    if (props.error.technicalError.message != null) {
      technicalError = props.error.technicalError.message;
    } else {
      technicalError = JSON.stringify(props.error.technicalError);
    }
  } else {
    technicalError = props.error.technicalError;
  }

  return (
    <div className="error-dialog-container">
      <div className="error-dialog">
        <div className="title">{props.error.title}</div>
        <div className="body">{props.error.body}</div>
        {technicalError && <TechnicalError message={technicalError} />}
        <button className="primary-button" onClick={props.dismissError}>OK</button>
      </div>
    </div>);
};
ErrorDialog.propTypes = {
  error: PropTypes.object,
  dismissError: PropTypes.func.isRequired,
};

const TechnicalError = props => (
  <div className="technical-error">
    <div>Information till IT-ansvarig:</div>
    <div>{props.message}</div>
  </div>
);
TechnicalError.propTypes = {
  message: PropTypes.string,
};


export default connect(null, { dismissError })(ErrorDialog);
