import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheckSquare from '@fortawesome/fontawesome-free-regular/faCheckSquare';
import faTimesCircle from '@fortawesome/fontawesome-free-regular/faTimesCircle';
import faSquare from '@fortawesome/fontawesome-free-regular/faSquare';

import './checkbox.scss';

const Checkbox = (props) => {
  // currently using times circle since times square isnt free...
  const graphics = props.acceptGraphics === false ? faTimesCircle : faCheckSquare;
  return (
    <button onClick={props.onChange} className="normalize-button checkbox">
      {
        props.checked ?
          <FontAwesomeIcon icon={graphics} />
          :
          <FontAwesomeIcon icon={faSquare} />
      }
      {props.text}
    </button>
  );
};
Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  text: PropTypes.string,
  acceptGraphics: PropTypes.bool, // set to false to show times-icon instead of check-icon
  onChange: PropTypes.func,
};

export default Checkbox;
