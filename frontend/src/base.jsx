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
        <div className="presentation">
          <div className="header">
            <img src="/img/logo.jpg" height="60px" width="60px"/>
            <span> Nopestradamus </span>
          </div>
          <div className="text">
            Do you or your friends try to predict the future? Document your predictions on this site and get reminded in
            the future! At nopestradamus we take our predictions seriously and will host them at a minimum until 2030!
          </div>
          <Link to="/prediction/create" className="primary-link">Create a prediction!</Link>
        </div>
        <PredictionList predictionList={this.props.latestPredictions}/>
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
