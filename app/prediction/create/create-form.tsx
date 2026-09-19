'use client'

import { useState, useTransition } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { TextAreaField, TextField } from '../../../components/ui/text-field.tsx'
import { toDateInputValue } from '../../../shared/date-util.ts'
import {
  DESCRIPTION_MAX_LENGTH,
  listPredictionErrors,
  MAX_PARTICIPANTS,
  TITLE_MAX_LENGTH,
  validatePrediction,
} from '../../../shared/validate-prediction.ts'
import { createPredictionAction } from '../../actions.ts'
import styles from './create-form.module.css'

type Status = 'editing' | 'posted'

interface CreateFormProps {
  /** The logged-in visitor's address, when there is one, so they do not type it again. */
  initialCreaterMail?: string | undefined
}

export default function CreateForm({ initialCreaterMail }: CreateFormProps) {
  const today = toDateInputValue(new Date())

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(today)
  const [createrMail, setCreaterMail] = useState(initialCreaterMail ?? '')
  const [isPublic, setIsPublic] = useState(true)
  const [participantList, setParticipantList] = useState<string[]>([])

  const [showValidationError, setShowValidationError] = useState(false)
  const [status, setStatus] = useState<Status>('editing')
  const [error, setError] = useState<string>()
  const [isPosting, startPosting] = useTransition()

  const input = { title, body, finishDate: date, isPublic, createrMail, participantList }
  const errors = validatePrediction(input, today)

  // Most messages wait for the first submit, so an empty form is not already red. Too long is
  // different: it is only ever the result of typing, and worth hearing before the next sentence.
  const shown = (message: string | undefined, isLive = false) =>
    showValidationError || isLive ? message : undefined

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setError(undefined)
    if (listPredictionErrors(errors).length > 0) {
      setShowValidationError(true)
      return
    }

    startPosting(async () => {
      try {
        const result = await createPredictionAction(input)
        if (result.ok) {
          setStatus('posted')
        } else {
          setError(result.error ?? 'Could not create the prediction.')
        }
      } catch (e) {
        // the action never answered: offline, or the request refused before it ran
        console.error(e)
        setError('Could not reach the server. Please try again.')
      }
    })
  }

  if (status === 'posted') {
    return (
      <div>
        <p className={styles.notice}>A mail has been sent to {createrMail}</p>
        <p className={styles.notice}>
          Please check your spam folder. It is VERY LIKELY that the mail is stuck there.
        </p>
        {participantList.length > 0 && (
          <p className={styles.notice}>
            As soon as you confirm the prediction through the mail we have sent you, the other
            participants will be mailed.
          </p>
        )}
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextAreaField
        label="Title"
        autoGrow
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={shown(errors.title, title.trim().length > TITLE_MAX_LENGTH)}
      />
      <TextAreaField
        label="Description"
        autoGrow
        value={body}
        onChange={(e) => setBody(e.target.value)}
        error={shown(errors.body, body.trim().length > DESCRIPTION_MAX_LENGTH)}
      />
      <TextField
        label="End date"
        type="date"
        value={date}
        min={today}
        onChange={(e) => setDate(e.target.value)}
        error={shown(errors.finishDate)}
      />
      <TextField
        label="Your mail"
        type="email"
        value={createrMail}
        onChange={(e) => setCreaterMail(e.target.value)}
        error={shown(errors.createrMail)}
      />

      <label className={styles.checkboxRow}>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Make this prediction public
      </label>

      <div className={styles.participants}>
        {participantList.map((participant, index) => (
          <div key={index} className={styles.participantRow}>
            <TextField
              label="Participant e-mail"
              type="email"
              value={participant}
              wrapperClassName={styles.participantField}
              onChange={(e) =>
                setParticipantList((list) => list.map((p, i) => (index === i ? e.target.value : p)))
              }
              error={shown(errors.participants?.[index])}
            />
            <Button
              variant="danger"
              className={styles.deleteButton}
              onClick={() => setParticipantList((list) => list.filter((_p, i) => index !== i))}
            >
              Delete
            </Button>
          </div>
        ))}
        <div>
          {participantList.length < MAX_PARTICIPANTS ? (
            <Button onClick={() => setParticipantList((list) => [...list, ''])}>
              Add participant
            </Button>
          ) : (
            <p className={styles.notice}>
              A prediction can have at most {MAX_PARTICIPANTS} participants.
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className={styles.submit} disabled={isPosting}>
        Create prediction
      </Button>
      {error !== undefined && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
