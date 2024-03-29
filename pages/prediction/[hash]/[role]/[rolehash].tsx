import { GetServerSideProps } from 'next'
import getServerUrl from '../../../../util/serverUrl'
import { PredictionCensored } from '../../../../shared'
import Prediction from '../../../../components/prediction'
import GoBackWrapper from '../../../../components/goBackWrapper'
import { Button } from '@mui/material'
import { useState } from 'react'
import { formatDateString } from '../../../../shared/date-util'
import { removeUndefined } from '../../../../shared/object-util'
import { getCensoredPrediction, getPrediction } from '../../../../server/prediction'

export const getServerSideProps: GetServerSideProps<PredictionProps> = async (context) => {
  const predictionHash = context.params!.hash as string
  const roleHash = context.params!.rolehash as string
  // TODO maybe create type for this
  const role = context.params!.role as 'creater' | 'participant'

  const prediction = await getPrediction(predictionHash)
  if (!prediction) {
    return {
      props: {
        predictionHash,
        roleHash,
        role,
      },
    }
  }
  let predictionCensored
  if (role === 'participant') {
    predictionCensored = getCensoredPrediction(prediction, roleHash)
  } else {
    predictionCensored = getCensoredPrediction(prediction)
  }

  return {
    props: removeUndefined({
      predictionCensored,
      predictionHash,
      roleHash,
      role,
    }),
  }
}

interface PredictionProps {
  predictionCensored?: PredictionCensored
  predictionHash: string
  roleHash: string
  role: string
}

export default function PredictionHash({
  predictionCensored,
  predictionHash,
  roleHash,
  role,
}: PredictionProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [accepted, setAccepted] = useState<boolean>()
  const [error, setError] = useState(false)

  const doAcceptPrediction = async (accept: boolean) => {
    setIsAccepting(true)
    try {
      const response = await fetch(
        `${getServerUrl()}/api/prediction/${predictionHash}/${role}/${roleHash}/${
          accept ? 'accept' : 'deny'
        }`,
        {
          method: 'POST',
        },
      )
      if (response.status < 400) {
        setAccepted(accept)
      } else {
        setError(true)
      }
    } catch (_e) {
      //
    }
    setIsAccepting(false)
  }

  if (error) {
    return (
      <GoBackWrapper>
        <div>An error has occurred. Sorry :(</div>
      </GoBackWrapper>
    )
  }

  if ((role !== 'creater' && role !== 'participant') || predictionCensored === undefined) {
    return (
      <GoBackWrapper>
        <div>Prediction not found</div>
      </GoBackWrapper>
    )
  }

  if (accepted === true) {
    return (
      <GoBackWrapper>
        <div>Thank you!</div>
        {predictionCensored.participants.length > 0 && role === 'creater' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              Please ask you participants to check their spam folders! They should receive a mail
              any second now:
            </div>
            {predictionCensored.participants.map((p) => {
              return <div key={p.mail}>{p.mail}</div>
            })}
          </div>
        )}
        <div style={{ marginTop: '40px' }}>
          And now you wait! You will receive a mail when the prediction ends on{' '}
          {formatDateString(predictionCensored.finish_date)}.
        </div>
      </GoBackWrapper>
    )
  }

  if (accepted === false) {
    return (
      <GoBackWrapper>
        <div>The prediction has been denied</div>
      </GoBackWrapper>
    )
  }

  return (
    <GoBackWrapper>
      <AcceptController
        predictionCensored={predictionCensored}
        role={role}
        isAccepting={isAccepting}
        doAcceptPrediction={doAcceptPrediction}
      />
      <Prediction prediction={predictionCensored} suppressNotAcceptedWarning={true} />
    </GoBackWrapper>
  )
}

interface AcceptControllerProps {
  predictionCensored: PredictionCensored
  role: string
  isAccepting: boolean
  doAcceptPrediction: (b: boolean) => void
}

const AcceptController = ({
  predictionCensored,
  role,
  isAccepting,
  doAcceptPrediction,
}: AcceptControllerProps) => {
  if (role === 'creater' && predictionCensored.creater.accepted !== undefined) {
    return (
      <div>
        You own this prediction and has{' '}
        {predictionCensored.creater.accepted ? 'accepted' : 'rejected'} it.
      </div>
    )
  }

  const participantAccepted = predictionCensored.participants.find((p) => p.isCurrentUser)?.accepted
  if (role === 'participant' && participantAccepted !== undefined) {
    return (
      <div>
        You are a participant in this prediction and has{' '}
        {participantAccepted ? 'accepted' : 'rejected'} it.
      </div>
    )
  }

  return (
    <div>
      <div>You can see the prediction below. Are you satisfied with it?</div>
      <div style={{ marginTop: '10px' }}>
        <Button
          variant="outlined"
          color="primary"
          disabled={isAccepting}
          onClick={() => doAcceptPrediction(true)}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          disabled={isAccepting}
          onClick={() => doAcceptPrediction(false)}
          style={{ marginLeft: '20px', color: 'red' }}
        >
          Reject
        </Button>
      </div>
    </div>
  )
}
