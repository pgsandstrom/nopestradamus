import { GetServerSideProps } from 'next'
import getServerUrl from '../../../../util/serverUrl'
import { PredictionCensored } from '../../../../shared'
import Prediction from '../../../../components/prediction'
import GoBackWrapper from '../../../../components/goBackWrapper'
import { Button } from '@material-ui/core'
import { useState } from 'react'
import { formatDateString } from '../../../../shared/date-util'
import { removeUndefined } from '../../../../shared/object-util'

export const getServerSideProps: GetServerSideProps<PredictionProps> = async (context) => {
  const predictionHash = context.params!.hash as string
  const roleHash = context.params!.rolehash as string
  const role = context.params!.role as string

  let url: string
  if (role === 'participant') {
    url = `${getServerUrl()}/api/v1/prediction/${predictionHash}/participant/${roleHash}`
  } else {
    url = `${getServerUrl()}/api/v1/prediction/${predictionHash}`
  }

  const response = await fetch(url, {
    method: 'GET',
  })

  console.log(role)

  if (response.status < 400) {
    const predictionCensored = (await response.json()) as PredictionCensored

    return {
      props: removeUndefined({
        predictionCensored,
        predictionHash,
        roleHash,
        role,
      }),
    }
  } else {
    context.res.statusCode = response.status
    return {
      props: {
        predictionHash,
        roleHash,
        role,
      },
    }
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
        `${getServerUrl()}/api/v1/prediction/${predictionHash}/${role}/${roleHash}/${
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

  if (role === 'creater' && predictionCensored.creater.accepted !== undefined) {
    return (
      <GoBackWrapper>
        <div>Prediction already {predictionCensored.creater.accepted ? 'accepted' : 'denied'}</div>
      </GoBackWrapper>
    )
  }

  const participantAccepted = predictionCensored.participants.find((p) => p.isCurrentUser)?.accepted
  if (role === 'participant' && participantAccepted !== undefined) {
    return (
      <GoBackWrapper>
        <div>Prediction already {participantAccepted ? 'accepted' : 'denied'}</div>
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
      <div>You can see the prediction below. Are you satisfied with it?</div>
      <div>
        <Button variant="outlined" disabled={isAccepting} onClick={() => doAcceptPrediction(true)}>
          Accept
        </Button>
        <Button variant="outlined" disabled={isAccepting} onClick={() => doAcceptPrediction(false)}>
          Deny
        </Button>
      </div>
      <Prediction prediction={predictionCensored} suppressNotAcceptedWarning={true} />
    </GoBackWrapper>
  )
}
