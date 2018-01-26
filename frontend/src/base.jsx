import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getLatestPredictions } from './prediction/actions';

import './base.scss';
import PredictionList from './prediction/component/predictionList';

class Base extends React.Component {
  componentDidMount() {
    if (this.props.latestPredictions == null) {
      this.props.getLatestPredictions();
    }
  }
  render() {
    return (
      <div className="base">
        <div className="first-stuff">
          <div className="intro">
            <span>Do your friends and relatives make bold predictions?</span>
          </div>
          <div className="quotes">
            <span>{'"'}We will run out of oil before 2020{'"'}</span>
            <span>{'"'}The whatevers will win the Superbowl{'"'}</span>
            <span>{'"'}In two years, bitcoin will be the only currency{'"'}</span>
          </div>
          <div className="outro">
            <span>Now you can hold them to their shitty claims! Nopestradamus will track predictions, and send a mail to all participants at a specified date!</span>
          </div>
          <Link to="/prediction/create" className="primary-link">Create a prediction!</Link>
        </div>
        <div className="second-stuff" >
          <PredictionList predictionList={this.props.latestPredictions} />
        </div>
      </div>);
  }
}
Base.propTypes = {
  latestPredictions: PropTypes.array,
  getLatestPredictions: PropTypes.func.isRequired,
};


export default connect(state => ({
  latestPredictions: state.prediction.latestPredictions,
}), {
  getLatestPredictions,
})(Base);
