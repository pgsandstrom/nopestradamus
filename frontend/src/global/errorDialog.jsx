import React from 'react';
import { connect } from 'react-redux';

import { dismissError } from './actions';

import './errorDialog.scss';

class ErrorDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleOkClick = this.handleOkClick.bind(this);
  }

  render() {
    if (!this.props || (!this.props.error)) {
      return null;
    }

    let technicalError;
    if (this.props.error.technicalError != null && typeof this.props.error.technicalError === 'object') {
      if (this.props.error.technicalError.message != null) {
        technicalError = this.props.error.technicalError.message;
      } else {
        technicalError = JSON.stringify(this.props.error.technicalError);
      }
    } else {
      technicalError = this.props.error.technicalError;
    }

    return (
      <div className="error-dialog-container">
        <div className="error-dialog">
          <div className="title">{this.props.error.title}</div>
          <div className="body">{this.props.error.body}</div>
          {technicalError && <TechnicalError message={technicalError} />}
          <button className="primary-button" onClick={this.props.dismissError} autoFocus>OK</button>
        </div>
      </div>);
  }
}
ErrorDialog.propTypes = {
  error: React.PropTypes.object,
  dismissError: React.PropTypes.func.isRequired,
};

const TechnicalError = props => (
  <div className="technical-error">
    <div>Information till IT-ansvarig:</div>
    <div>{props.message}</div>
  </div>
);
TechnicalError.propTypes = {
  message: React.PropTypes.string,
};


export default connect(null, { dismissError })(ErrorDialog);
