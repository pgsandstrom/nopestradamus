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
  const hash = context.params!.hash as string
  const response = await fetch(`${getServerUrl()}/api/v1/prediction/${hash}`, {
    method: 'GET',
  })

  if (response.status < 400) {
    const predictionCensored = (await response.json()) as PredictionCensored

    return {
      props: removeUndefined({
        predictionCensored,
        createrAccepted: predictionCensored.creater.accepted,
      }),
    }
  } else {
    context.res.statusCode = response.status
    return { props: {} }
  }
}

interface PredictionProps {
  predictionCensored?: PredictionCensored
  createrAccepted?: boolean
}

export default function PredictionHash({ predictionCensored, createrAccepted }: PredictionProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [accepted, setAccepted] = useState<boolean>()

  const doAcceptPrediction = async (accept: boolean) => {
    setIsAccepting(true)
    try {
      await fetch(
        `${getServerUrl()}//api/v1/prediction/:prediction/creater/:hash/${
          accept ? 'accept' : 'deny'
        }`,
        {
          method: 'POST',
        },
      )
      setAccepted(true)
    } catch (_e) {
      setIsAccepting(false)
    }
  }

  if (predictionCensored === undefined) {
    return (
      <GoBackWrapper>
        <div>Prediction not found</div>
      </GoBackWrapper>
    )
  }

  if (createrAccepted !== undefined) {
    return (
      <GoBackWrapper>
        <div>Prediction already {createrAccepted ? 'accepted' : 'denied'}</div>
      </GoBackWrapper>
    )
  }

  if (accepted === true) {
    return (
      <GoBackWrapper>
        <div>Thank you!</div>
        {predictionCensored.participants.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div>
              Please ask you participants to check their spam folders! They should receive a mail
              any second now.
            </div>
            {predictionCensored.participants.map((p) => {
              return <div key={p.mail}>{p.mail}</div>
            })}
          </div>
        )}
        <div style={{ marginTop: '20px' }}>
          You will receive a mail on {formatDateString(predictionCensored.finish_date)}
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
