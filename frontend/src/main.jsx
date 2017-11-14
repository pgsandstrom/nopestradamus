import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';

import ErrorDialog from './global/errorDialog';

import './main.scss';

const mapStateToProps = state =>
  ({
    error: state.globalReducer.error,
  });

const mapDispatchToProps = {
};
const Test = () => <div>2</div>;

class LoggedIn extends React.Component {
  componentWillMount() {
  }

  render() {
    return (
      <div className="react-root">
        <div className="main-banner" />
        <div className="main-body">
          {JSON.stringify(this.props.match)}
          <Link to={'/1/2'}>
            Example topic
          </Link>
        </div>
        <ErrorDialog error={this.props.error} />
        <Route path={`${this.props.match.url}/2`} component={Test} />
        <Route path={'/2'} component={Test} />
        <Route path={'/1/2'} component={Test} />
        <Route path={'2'} component={Test} />
      </div>
    );
  }
}
LoggedIn.propTypes = {
  children: PropTypes.object,
  error: PropTypes.object,
};
const ConnectedLoggedIn = connect(mapStateToProps, mapDispatchToProps)(LoggedIn);


const Main = () => {
  // return[
  // <Route path="/" component={ConnectedLoggedIn} />
  // <Route path="/hej" component={ConnectedLoggedIn} />
  //   ]};
  console.log();
  return [<Route path="/1" component={ConnectedLoggedIn} />, <Route path="/2" component={Test} />];
  // return <div><Route path="/1" component={ConnectedLoggedIn} /><Route path="/2" component={Test} /></div>;
};

export default Main;
