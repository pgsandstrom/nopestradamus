import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Route } from 'react-router-dom';

import Base from './base';
import Create from './prediction/create';
import ErrorDialog from './global/errorDialog';

import './main.scss';

const mapStateToProps = state =>
  ({
    error: state.globalReducer.error,
  });

const mapDispatchToProps = {
};

const Main = props => (
  <div className="react-root">
    <div className="main-banner" >
      Nopestradamus
    </div>
    <div className="main-body">
      <Route path={'/create'} component={Create} />
      <Route path={'/'} exact component={Base} />
    </div>
    <ErrorDialog error={props.error} />
  </div>
);
Main.propTypes = {
  error: PropTypes.string,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));
