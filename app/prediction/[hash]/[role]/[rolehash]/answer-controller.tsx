'use client'

import { useState, useTransition } from 'react'

import Prediction from '../../../../../components/prediction.tsx'
import { Button } from '../../../../../components/ui/button.tsx'
import { formatDateString } from '../../../../../shared/date-util.ts'
import type { PredictionCensored, Role } from '../../../../../shared/index.ts'
import { answerPredictionAction } from '../../../../actions.ts'
import styles from './answer-controller.module.css'

interface AnswerControllerProps {
  prediction: PredictionCensored
  predictionHash: string
  role: Role
  roleHash: string
}

export default function AnswerController({
  prediction,
  predictionHash,
  role,
  roleHash,
}: AnswerControllerProps) {
  const [answer, setAnswer] = useState<boolean>()
  const [error, setError] = useState<string>()
  const [isAnswering, startAnswering] = useTransition()

  const doAnswer = (accept: boolean) => {
    startAnswering(async () => {
      const result = await answerPredictionAction(predictionHash, role, roleHash, accept)
      if (result.ok) {
        setAnswer(accept)
      } else {
        setError(result.error)
      }
    })
  }

  if (error !== undefined) {
    return <p className={styles.error}>{error} Sorry :(</p>
  }

  if (answer === true) {
    return (
      <div>
        <p>Thank you!</p>
        {prediction.participants.length > 0 && role === 'creater' && (
          <div className={styles.block}>
            <p>
              Please ask your participants to check their spam folders! They should receive a mail
              any second now:
            </p>
            <ul className={styles.mailList}>
              {prediction.participants.map((p) => (
                <li key={p.mail}>{p.mail}</li>
              ))}
            </ul>
          </div>
        )}
        <p className={styles.wait}>
          And now you wait! You will receive a mail when the prediction ends on{' '}
          {formatDateString(prediction.finish_date)}.
        </p>
      </div>
    )
  }

  if (answer === false) {
    return <p>The prediction has been denied</p>
  }

  return (
    <>
      <AnswerPrompt
        prediction={prediction}
        role={role}
        isAnswering={isAnswering}
        doAnswer={doAnswer}
      />
      <Prediction prediction={prediction} suppressNotAcceptedWarning />
    </>
  )
}

interface AnswerPromptProps {
  prediction: PredictionCensored
  role: Role
  isAnswering: boolean
  doAnswer: (accept: boolean) => void
}

function AnswerPrompt({ prediction, role, isAnswering, doAnswer }: AnswerPromptProps) {
  if (role === 'creater' && prediction.creater.accepted !== undefined) {
    return (
      <p>
        You own this prediction and have {prediction.creater.accepted ? 'accepted' : 'rejected'} it.
      </p>
    )
  }

  const participantAccepted = prediction.participants.find((p) => p.isCurrentUser)?.accepted
  if (role === 'participant' && participantAccepted !== undefined) {
    return (
      <p>
        You are a participant in this prediction and have{' '}
        {participantAccepted ? 'accepted' : 'rejected'} it.
      </p>
    )
  }

  return (
    <div>
      <p>You can see the prediction below. Are you satisfied with it?</p>
      <div className={styles.actions}>
        <Button disabled={isAnswering} onClick={() => doAnswer(true)}>
          Accept
        </Button>
        <Button variant="danger" disabled={isAnswering} onClick={() => doAnswer(false)}>
          Reject
        </Button>
      </div>
    </div>
  )
}
