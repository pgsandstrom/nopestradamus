import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Prediction from './component/prediction';

export default class ViewPrediction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      predicition: null,
    };
  }
  componentDidMount() {
    const hash = this.props.match.params.hash;
    fetch(`/api/v1/prediction/${hash}`)
      .then(data => data.json())
      .then((prediction) => {
        this.setState({ prediction });
      })
      .catch(() => console.log('error'));
  }
  render() {
    return (
      <div>
        <Prediction prediction={this.state.prediction} />
      </div>
    );
  }
}
ViewPrediction.propTypes = {
  match: PropTypes.object.isRequired,
};

