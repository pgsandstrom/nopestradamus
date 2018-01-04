import React from 'react';
import PropTypes from 'prop-types';
import TextAreaAutosize from 'react-autosize-textarea';

import './create.scss';

export default class CreatePrediction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      body: '',
      participantList: [''],
    };
  }
  render() {
    return (
      <div className="create-prediction">
        <div>CREATE A PREDICTION!!</div>
        <div>
          <span>title: </span>
          <input
            className="standard-input"
            value={this.state.title}
            placeholder="title"
            onChange={e => this.setState({ title: e.target.value })}
          />
        </div>
        <div>
          <span>body: </span>
          <TextAreaAutosize
            className="standard-textarea"
            value={this.state.body}
            placeholder="describe the prediction"
            onChange={e => this.setState({ body: e.target.value })}
          />
        </div>
        <div>
          Okay, so pls give the participants:
        </div>
        <div>
          {this.state.participantList.map((participant, index) =>
            (<Participant
              key={index}
              participant={this.state.participantList[index]}
              onChange={(value) => {
                const participantList = [...this.state.participantList];
                participantList[index] = value;
                this.setState({ participantList });
              }}
              onRemove={() => {
                const participantList = [...this.state.participantList];
                participantList.splice(index, 1);
                this.setState({ participantList });
              }}
            />))}
        </div>
        <button onClick={() => {
          this.setState({ participantList: [...this.state.participantList, ''] });
        }}
        >Add participant</button>

      </div>
    );
  }
}

const Participant = props => (
  <div>
    <input className="standard-input" value={props.participant} onChange={e => props.onChange(e.target.value)} />
    <button onClick={() => props.onRemove()}>remove</button>
  </div>
);
Participant.propTypes = {
  participant: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
