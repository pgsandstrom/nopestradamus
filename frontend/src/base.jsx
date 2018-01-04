import React from 'react';
import { Link } from 'react-router-dom';

import './base.scss';

export default () => (
  <div className="base">
    <div className="first-stuff">
      <Link to={'/create'} className="primary-link">Go ahead, create a prediction!</Link>
    </div>
    <div className="second-stuff"></div>
  </div>);
