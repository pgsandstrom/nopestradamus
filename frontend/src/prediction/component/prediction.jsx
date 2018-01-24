import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import './prediction.scss';

const Prediction = (props) => {
  if (props.prediction == null) {
    return <div>loading</div>;
  }
  return (
    <div>
      <h1>{props.prediction.title}</h1>
      <div>
        {props.prediction.body}
      </div>
    </div>
  );
};
Prediction.propTypes = {
  prediction: PropTypes.object,
};

export default Prediction;
