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
      hej
    </div>
  );
};
Prediction.propTypes = {
  prediction: PropTypes.object,
};

export default Prediction;
