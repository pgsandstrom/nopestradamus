import React from 'react';
import PropTypes from 'prop-types';
import Prediction from './component/prediction';

class ParticipantAccept extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prediction: null,
      response: null,
      failedGet: false,
    };
    this.sendAccept = this.sendAccept.bind(this);
    this.sendDeny = this.sendDeny.bind(this);
  }

  componentDidMount() {
    // TODO pick correct hash and stuff
    const predictionHash = this.props.match.params.predictionHash;
    const participantHash = this.props.match.params.participantHash;
    fetch(`/api/v1/prediction/${predictionHash}/participant/${participantHash}`)
      .then(data => data.json())
      .then((prediction) => {
        this.setState({ prediction });
      })
      .catch(() => {
        this.setState({ failedGet: true });
      });
  }

  getParticipant() {
    const participantHash = this.props.match.params.participantHash;
    return this.state.prediction.participants.find(p => p.hash === participantHash);
  }

  sendResponse(response) {
    const predictionHash = this.props.match.params.predictionHash;
    const participantHash = this.props.match.params.participantHash;
    const options = {
      method: 'POST',
      credentials: 'same-origin',
    };
    fetch(`/api/v1/prediction/${predictionHash}/participant/${participantHash}/${response ? 'accept' : 'deny'}`, options)
      .then(() => { this.setState({ response }); })
      .catch(() => console.log('error'));
  }

  sendAccept() {
    this.sendResponse(true);
  }

  sendDeny() {
    this.sendResponse(false);
  }


  render() {
    // TODO check if it is already accepted
    if (this.state.prediction == null) {
      return <div>loading</div>;
    }
    if (this.state.response === true) {
      return <div>IT HAS BEEN DONE!!!</div>;
    }
    if (this.state.response === false) {
      return <div>IT HAS BEEN DENIED!!! The bet has been destroyed!</div>;
    }
    if (this.state.failedGet) {
      return <div>Well, something went wrong. Maybe this prediction doesnt exist?</div>;
    }
    if (this.getParticipant().accepted === true) {
      return <div>This bet has already been accepted</div>;
    }
    if (this.getParticipant().accepted === false) {
      return <div>This bet has already been denied</div>;
    }
    return (
      <div>
        <div>Do you accept this prediction below? Press the button to confirm!</div>
        <button onClick={this.sendAccept}>I really did</button>
        <button onClick={this.sendDeny}>I honestly did not</button>
        <Prediction prediction={this.state.prediction} />
      </div>
    );
  }
}
ParticipantAccept.propTypes = {
  match: PropTypes.object.isRequired,
};


export default ParticipantAccept;
