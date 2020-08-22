import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { useState } from 'react'
import { Button, TextField, Checkbox, FormControlLabel } from '@material-ui/core'
import getServerUrl from '../../util/serverUrl'
import {
  validateCreaterMail,
  validateTitle,
  validateDescription,
  validateDate,
  validateParticipant,
} from '../../shared/validatePrediction'
import Link from 'next/link'

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
      !participantList.every((p) => validateParticipant(p, participantList))
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
          <Link href="/">
            <Button variant="outlined" style={{ alignSelf: 'start', marginTop: '20px' }}>
              Go Back
            </Button>
          </Link>
          <div style={{ marginTop: '10px' }}>A mail has been sent to {createrMail}</div>
          <div style={{ marginTop: '10px' }}>
            Please check your spam folder. It is VERY LIKELY that the mail is stuck there.
          </div>
          {participantList.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              As soon as you confirm the prediction through the mail we have sent you, the other
              participants will be mailed.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
          <Link href="/">
            <Button variant="outlined" style={{ alignSelf: 'start', marginTop: '20px' }}>
              Go Back
            </Button>
          </Link>
          <TextField
            label="Title"
            multiline
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={showError && !validateTitle(title)}
            helperText={showError && !validateTitle(title) ? 'Invalid title' : ''}
            style={{ marginTop: '10px' }}
          />
          <TextField
            label="Description"
            multiline
            value={body}
            onChange={(e) => setBody(e.target.value)}
            error={showError && !validateDescription(body)}
            helperText={showError && !validateDescription(body) ? 'Invalid description' : ''}
            style={{ marginTop: '10px' }}
          />
          <KeyboardDatePicker
            variant="inline"
            format="yyyy-MM-dd"
            margin="normal"
            label="End date"
            value={date}
            onChange={(date) => setDate(date)}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            error={showError && !validateDate(date)}
            helperText={showError && !validateDate(date) ? 'Invalid date' : ''}
          />
          <TextField
            label="Your mail"
            value={createrMail}
            onChange={(e) => setCreaterMail(e.target.value)}
            error={showError && !validateCreaterMail(createrMail)}
            helperText={showError && !validateCreaterMail(createrMail) ? 'Invalid mail' : ''}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isPublic}
                onChange={(e) => {
                  setIsPublic(e.target.checked)
                }}
              />
            }
            label="Should this prediction be public?"
            style={{ marginTop: '10px' }}
          />
          <div
            style={{
              // borderTop: '1px solid gray',
              // borderBottom: '1px solid gray',
              margin: '20px 10px',
            }}
          >
            {participantList.map((participant, index) => {
              return (
                <div
                  key={index}
                  style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}
                >
                  <TextField
                    label="Participant"
                    value={participant}
                    onChange={(e) => {
                      setParticipantList(
                        participantList.map((p, i) => (index === i ? e.target.value : p)),
                      )
                    }}
                    error={showError && !validateParticipant(participant, participantList)}
                    helperText={
                      showError && !validateParticipant(participant, participantList)
                        ? 'Invalid participant'
                        : ''
                    }
                    style={{ flex: '1 0 0' }}
                  />
                  <Button
                    onClick={() =>
                      setParticipantList((participantList) => {
                        return participantList.filter((_p, i) => index !== i)
                      })
                    }
                    variant="outlined"
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </Button>
                </div>
              )
            })}
            <div>
              <Button
                onClick={() => setParticipantList([...participantList, ''])}
                variant="outlined"
                style={{ margin: '10px 0' }}
              >
                Add participant
              </Button>
            </div>
          </div>

          <Button onClick={onCreate} variant="outlined" style={{ marginTop: '20px' }}>
            Create prediction
          </Button>
        </div>
      </div>
    </MuiPickersUtilsProvider>
  )
}
