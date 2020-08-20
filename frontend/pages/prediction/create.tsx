import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { useState } from 'react'
import { Button, TextField, Checkbox } from '@material-ui/core'
import getServerUrl from '../../util/serverUrl'
import {
  validateCreaterMail,
  validateTitle,
  validateDescription,
  validateDate,
  validateParticipantList,
} from '../../shared/validatePrediction'
import { deserialize } from 'v8'

export default function CreatePrediction() {
  const [title, setTitle] = useState('')

  const [body, setBody] = useState('')

  const [date, setDate] = useState<Date | null>(() => new Date())

  const [createrMail, setCreaterMail] = useState('')

  const [isPublic, setIsPublic] = useState(true)
  const [participantList, setParticipantList] = useState<string[]>([])

  const [showError, setShowError] = useState(false)

  const [isPosting, setIsPosting] = useState(false)
  const [posted, setPosted] = useState(false)

  const onCreate = async () => {
    if (
      !validateTitle(title) ||
      !validateDescription(body) ||
      !validateDate(date) ||
      !validateCreaterMail(createrMail) ||
      !validateParticipantList(participantList)
    ) {
      setShowError(true)
      return
    }
    setIsPosting(true)
    try {
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

      setPosted(true)
    } catch (e) {
      // TODO show error
    }
    setIsPosting(false)
  }

  if (posted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
          ok check ur mail. CHECK SPAM FOLDER!!!
        </div>
      </div>
    )
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={showError && !validateTitle(title)}
            helperText={showError && !validateTitle(title) ? 'Invalid title' : ''}
            style={{ marginTop: '10px' }}
          />
          <TextField
            label="Description"
            value={body}
            variant="outlined"
            onChange={(e) => setBody(e.target.value)}
            error={showError && !validateDescription(body)}
            helperText={showError && !validateDescription(body) ? 'Invalid description' : ''}
            style={{ marginTop: '10px' }}
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
            error={showError && !validateDate(date)}
            helperText={showError && !validateDate(date) ? 'Invalid date' : ''}
          />
          <div style={{ height: '100px' }}>
            <TextField
              label="Your mail"
              value={createrMail}
              onChange={(e) => setCreaterMail(e.target.value)}
              error={showError && !validateCreaterMail(createrMail)}
              helperText={showError && !validateCreaterMail(createrMail) ? 'Invalid mail' : ''}
            />
          </div>
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
      </div>
    </MuiPickersUtilsProvider>
  )
}
