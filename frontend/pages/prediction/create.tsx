import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { useState } from 'react'
import { Button, TextField, Checkbox } from '@material-ui/core'
import getServerUrl from '../../util/serverUrl'

export default function CreatePrediction() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState<Date | null>(() => new Date())
  const [createrMail, setCreaterMail] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [participantList, setParticipantList] = useState<string[]>([])

  const onCreate = async () => {
    await fetch(`${getServerUrl()}/api/v1/prediction`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        body,
        finishDate: date,
        isPublic: isPublic,
        creater: createrMail,
        participantList,
      }),
      credentials: 'same-origin',
    })
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField
          label="Description"
          value={body}
          variant="outlined"
          onChange={(e) => setBody(e.target.value)}
        />
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Date picker inline"
          value={date}
          onChange={(date) => setDate(date)}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        <TextField
          label="Your mail"
          value={createrMail}
          onChange={(e) => setCreaterMail(e.target.value)}
        />
        <div>
          {participantList.map((participant, index) => {
            return (
              <div key={index}>
                <TextField
                  label="Participant"
                  value={participant}
                  onChange={(e) => {
                    setParticipantList(
                      participantList.map((p, i) => (index === i ? e.target.value : p)),
                    )
                  }}
                />
                <Button
                  onClick={() =>
                    setParticipantList((participantList) => {
                      return participantList.filter((_p, i) => index !== i)
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            )
          })}
          <div>
            <Button onClick={() => setParticipantList([...participantList, ''])}>
              Add participant
            </Button>
          </div>
        </div>
        <Checkbox
          checked={isPublic}
          onChange={(e) => {
            setIsPublic(e.target.checked)
          }}
        />
        <Button onClick={onCreate}>Create</Button>
      </div>
    </MuiPickersUtilsProvider>
  )
}
