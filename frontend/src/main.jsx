import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Switch } from 'react-router';
import { Route } from 'react-router-dom';

import Base from './base';
import Create from './prediction/create';
import View from './prediction/view';
import CreaterAccept from './prediction/createrAccept';
import ErrorDialog from './global/errorDialog';
import NotFound from './notFound';

import './main.scss';

const mapStateToProps = state =>
  ({
    error: state.global.error,
  });

const mapDispatchToProps = {
};

const Main = props => (
  <div className="react-root">
    <div className="main-banner" >
      Nopestradamus
    </div>
    <div className="main-body">
      <Switch>
        <Route path="/prediction/create" component={Create} />
        <Route path="/prediction/:predictionHash/creater/:createrHash" component={CreaterAccept} />
        <Route path="/prediction/:predictionHash/creater/:createrHash" component={Create} />
        <Route path="/prediction/:predictionHash/participant/:participantHash" component={Create} />
        <Route path="/prediction/:predictionHash/participant/:participantHash" component={Create} />
        <Route path="/prediction/:hash" component={View} />
        <Route component={NotFound} />
      </Switch>
      <Route path="/" exact component={Base} />
    </div>
    <ErrorDialog error={props.error} />
  </div>
);
Main.propTypes = {
  error: PropTypes.string,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));
