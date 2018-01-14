import React from 'react';
import { Link } from 'react-router-dom';

import './base.scss';

export default () => (
  <div className="base">
    <div className="first-stuff">
      <div className="intro">
        <span>Does your friends and relatives make bold predictions?</span>
      </div>
      <div className="quotes">
        <span>{'"'}We will run out of oil before 2020{'"'}</span>
        <span>{'"'}The whatevers will win the Superbowl{'"'}</span>
        <span>{'"'}In two years, bitcoin will be the only currency{'"'}</span>
      </div>
      <div className="outro">
        <span>Now you can hold them to their shitty claims! Nopestradamus will track predictions, and send a mail to all participants at a specified date!</span>
      </div>
      <Link to={'/create'} className="primary-link">Create a prediction!</Link>
    </div>
    <div className="second-stuff" />
  </div>);
