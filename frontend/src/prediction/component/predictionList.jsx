import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PredictionList = (props) => {
  if (props.predictionList == null) {
    return <div>loading</div>;
  }
  return (
    <div>
      {props.predictionList.map(prediction => (<div>
        <Link to={`/prediction/${prediction.hash}`} className="primary-link">{prediction.title}</Link>
      </div>))}
    </div>
  );
};
PredictionList.propTypes = {
  predictionList: PropTypes.array,
};

export default PredictionList;
