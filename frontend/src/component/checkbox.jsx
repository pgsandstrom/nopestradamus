import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheckSquare from '@fortawesome/fontawesome-free-regular/faCheckSquare';
import faSquare from '@fortawesome/fontawesome-free-regular/faSquare';

// import './checkbox.scss';

const Checkbox = props => (
  <button onClick={props.onChange} className="normalize-button">
    {
      props.checked ?
        <FontAwesomeIcon icon={faCheckSquare} />
        :
        <FontAwesomeIcon icon={faSquare} />
    }
  </button>
);
Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Checkbox;
