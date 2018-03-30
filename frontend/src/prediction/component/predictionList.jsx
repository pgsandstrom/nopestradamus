import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './predictionList.scss';

const PredictionList = (props) => {
  if (props.predictionList == null) {
    return <div>loading</div>;
  }
  return (
    <div className="prediction-list">
      <div className="title">Here are the latest public predictions made on the site!</div>
      <div className="list">
      {props.predictionList.map(prediction => (<div className="item">
        <Link to={`/prediction/${prediction.hash}`} className="primary-link">{prediction.title}</Link>
      </div>))}
      </div>
    </div>
  );
};
PredictionList.propTypes = {
  predictionList: PropTypes.array,
};

export default PredictionList;
