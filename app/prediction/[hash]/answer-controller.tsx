'use client'

import { useState, useTransition } from 'react'

import Prediction from '../../../components/prediction.tsx'
import { Button } from '../../../components/ui/button.tsx'
import { formatDateString } from '../../../shared/date-util.ts'
import type { PredictionView, Role } from '../../../shared/index.ts'
import { answerPredictionAction } from '../../actions.ts'
import styles from './answer-controller.module.css'

interface AnswerControllerProps {
  prediction: PredictionView
  predictionHash: string
  /** The role the session holds on this prediction. The server decides it again when answering. */
  role: Role
}

export default function AnswerController({
  prediction,
  predictionHash,
  role,
}: AnswerControllerProps) {
  const [answer, setAnswer] = useState<boolean>()
  const [error, setError] = useState<string>()
  const [isAnswering, startAnswering] = useTransition()

  const doAnswer = (accept: boolean) => {
    startAnswering(async () => {
      const result = await answerPredictionAction(predictionHash, accept)
      if (result.ok) {
        setAnswer(accept)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <div className={styles.panel}>
        <AnswerPanelContent
          prediction={prediction}
          role={role}
          answer={answer}
          error={error}
          isAnswering={isAnswering}
          doAnswer={doAnswer}
        />
      </div>
      <Prediction prediction={prediction} suppressNotAcceptedWarning />
    </>
  )
}

interface AnswerPanelContentProps extends AnswerPromptProps {
  answer: boolean | undefined
  error: string | undefined
}

function AnswerPanelContent({ answer, error, ...promptProps }: AnswerPanelContentProps) {
  if (error !== undefined) {
    return <p className={styles.error}>{error} Sorry :(</p>
  }

  if (answer === true) {
    // uncensored, since only somebody who is part of the prediction gets to answer it
    const participantMails = promptProps.prediction.participants.map((p) => p.mail)
    return (
      <div>
        <p className={styles.heading}>Thank you!</p>
        {participantMails.length > 0 && (
          <p>
            Your participants should receive a mail any second now, ask them to check their spam
            folders: <span className={styles.mails}>{participantMails.join(', ')}</span>
          </p>
        )}
        <p>
          You will receive a mail when the prediction ends on{' '}
          {formatDateString(promptProps.prediction.finish_date)}.
        </p>
      </div>
    )
  }

  if (answer === false) {
    return <p className={styles.heading}>The prediction has been rejected.</p>
  }

  return <AnswerPrompt {...promptProps} />
}

interface AnswerPromptProps {
  prediction: PredictionView
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
      <p className={styles.heading}>You can see the prediction below. Are you satisfied with it?</p>
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
