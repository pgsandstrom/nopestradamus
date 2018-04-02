import React from 'react';
import PropTypes from 'prop-types';
import TextAreaAutosize from 'react-autosize-textarea';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

import './create.scss';
import CheckBox from '../component/checkbox';

export default class CreatePrediction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      body: '',
      creater: '',
      participantList: [''],
      finishDate: moment().startOf('day'),
      isPublic: true,
      isCreated: false,
    };

    this.onChangeIsPublic = this.onChangeIsPublic.bind(this);
  }

  onChangeIsPublic() {
    this.setState({ isPublic: !this.state.isPublic });
  }

  onAddParticipant() {
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
      creater: this.state.creater,
      finishDate: this.state.finishDate,
      isPublic: this.state.isPublic,
      participantList: this.state.participantList,
    };
    const options = {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'same-origin',
    };
    fetch('/api/v1/prediction', options)
      .then(() => this.setState({ isCreated: true }))
      .catch(() => console.log('error'));
  }

  render() {
    if (this.state.isCreated) {
      return <div>You should shortly receive a mail! Please check your spam folder. If it was marked as spam make sure to mark it as not spam so the final mail at {this.state.finishDate.format('YYYY-MM-DD')} comes through.</div>;
    }
    return (
      <div className="create-prediction">

        <div className="title-stuff">
          <img src="/img/logo.jpg" height="180px" width="180px"/>
          <div>CREATE A PREDICTION!!</div>
        </div>

        <div className="input-row">
        </div>


        <div className="input-row">
          <div className="title">
            Describe your shitty prediction!
          </div>
          <input
            className="input standard-input"
            value={this.state.title}
            placeholder="title"
            onChange={e => this.setState({ title: e.target.value })}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <div className="input-row">
          <TextAreaAutosize
            className="input standard-textarea"
            value={this.state.body}
            placeholder="description"
            onChange={e => this.setState({ body: e.target.value })}
            rows={1}
          />
        </div>

        <div className="input-row one-liner">
          <div className="title">Pick an end date:</div>
          <div
            className="datepicker-wrapper"
          >
            <DatePicker
              selected={this.state.finishDate}
              onChange={e => this.setState({ finishDate: e })}
              customInput={<button>{this.state.finishDate.format('YYYY-MM-DD')}</button>}
            />
          </div>
        </div>

        <div className="input-row">
          <CheckBox checked={this.state.isPublic} onChange={this.onChangeIsPublic} text="Should this prediciton be public?"/>
        </div>

        <div className="input-row">
          <div>
            Here is YOUR mail. You will receive a verification mail.
          </div>
          <div>
            <input
              placeholder="Your mail"
              className="standard-input"
              value={this.state.creater}
              onChange={e => this.setState({ creater: e.target.value })}
            />
          </div>
        </div>

        <div className="input-row">
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
          </div>
        </div>

        <button onClick={() => this.onAddParticipant()} style={{ marginTop: '10px' }}>Add participant</button>

        <div style={{ marginTop: '20px' }}>
          <button
            className="create-button"
            onClick={() => this.onCreatePrediction()}
          >
            CREATE PREDICTION
          </button>
        </div>

      </div>
    );
  }
}

const Participant = props => (
  <div className="participant">
    <input
      className="standard-input"
      value={props.participant}
      onChange={e => props.onChange(e.target.value)}
      placeholder="participant mail"
    />
    <button onClick={() => props.onRemove()}>Remove participant</button>
  </div>
);
Participant.propTypes = {
  participant: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
