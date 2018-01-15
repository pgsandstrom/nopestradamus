import React from 'react';
import PropTypes from 'prop-types';
import TextAreaAutosize from 'react-autosize-textarea';
import DatePicker from 'react-datepicker';
import moment from 'moment';
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import 'react-datepicker/dist/react-datepicker.css';

import './create.scss';

export default class CreatePrediction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      body: '',
      creator: '',
      participantList: [''],
      finishDate: moment().startOf('day'),
    };
  }
  onAddParticipant() {
    console.log(this);
    this.setState({ participantList: [...this.state.participantList, ''] });
  }
  onRemoveParticipant(index) {
    const participantList = [...this.state.participantList];
    participantList.splice(index, 1);
    this.setState({ participantList });
  }
  onChangeParticipant(index, value) {
    const participantList = [...this.state.participantList];
    participantList[index] = value;
    this.setState({ participantList });
  }
  onCreatePrediction() {
    const data = {
      title: this.state.title,
      body: this.state.body,
      creator: this.state.creator,
      finishDate: this.state.finishDate,
      isPublic: true,
      participantList: this.state.participantList,
    };
    const options = {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'same-origin',
    };
    fetch('/api/v1/prediction', options)
      .then(() => console.log('done'))
      .catch(() => console.log('error'));
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
          <DatePicker
            selected={this.state.finishDate}
            onChange={e => this.setState({ finishDate: e })}
          />
        </div>
        <div>
          Here is YOUR mail. You will receive a verification mail.
        </div>
        <div>
          <input className="standard-input" value={this.state.creator} onChange={e => this.setState({ creator: e.target.value })} />
        </div>
        <div>
          Okay, so pls give the other participants (if there are any)
        </div>
        <div>
          {this.state.participantList.map((participant, index) =>
            (<Participant
              key={index}
              participant={this.state.participantList[index]}
              onChange={value => this.onChangeParticipant(index, value)}
              onRemove={() => this.onRemoveParticipant(index)}
            />))}
          <button onClick={() => this.onAddParticipant()}>Add participant</button>
        </div>
        <div>
          <button onClick={() => this.onCreatePrediction()}>CREATE PREDICTION</button>
        </div>
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
