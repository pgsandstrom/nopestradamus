import React from 'react';
import PropTypes from 'prop-types';

import './prediction.scss';
import Checkbox from '../../component/checkbox';

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
      <div>
        creater: {props.prediction.creater.mail}
      </div>
      <div>
        <div>participants</div>
        {props.prediction.participants.map(participant => (
          <div key={participant.mail}>
            <Checkbox checked={participant.accepted != null} acceptGraphics={participant.accepted !== false} />
            <span>{participant.mail}</span>
          </div>
          ))}
      </div>
    </div>
  );
};
Prediction.propTypes = {
  prediction: PropTypes.object,
};

export default Prediction;
