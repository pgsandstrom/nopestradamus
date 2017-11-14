import React from 'react';
import { connect } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import Cookies from 'js-cookie';

import { initData } from './global/actions';
import ErrorDialog from './global/errorDialog';

import './main.scss';

const mapStateToProps = state =>
  ({
    error: state.globalReducer.error,
  });

const mapDispatchToProps = {
  initData,
};

class LoggedIn extends React.Component {
  componentWillMount() {
    this.props.initData();
  }

  render() {
    return (
      <div className="react-root">
        <div className="main-banner" />
        <div className="main-body">
          hej
          {this.props.children}
        </div>
        <ErrorDialog error={this.props.error} />
      </div>
    );
  }
}
LoggedIn.propTypes = {
  children: React.PropTypes.object,
  error: React.PropTypes.object,
  initData: React.PropTypes.func.isRequired,
};
const ConnectedLoggedIn = connect(mapStateToProps, mapDispatchToProps)(LoggedIn);

const requireAuth = (nextState, replace) => {
  // if (Cookies.get('login') === undefined) {
  //   replace({
  //     pathname: '/login',
  //     state: { nextPathname: nextState.location.pathname },
  //   });
  // }
};

const Main = () => (
  <Router history={browserHistory}>
    <Route path="/" component={ConnectedLoggedIn} onEnter={requireAuth} />
    {/* <Route path="/login" component={Login} />*/}
    {/*<Route path="/settings" component={Settings} onEnter={requireAuth} />*/}
  </Router>
);

export default Main;
