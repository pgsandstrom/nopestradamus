import { GetServerSideProps } from 'next'
import { PredictionCensored } from '../../shared'
import getServerUrl from '../../util/serverUrl'
import Prediction from '../../components/prediction'
import GoBackWrapper from '../../components/goBackWrapper'

export const getServerSideProps: GetServerSideProps<PredictionProps> = async (context) => {
  const hash = context.params!.hash as string
  const response = await fetch(`${getServerUrl()}/api/v1/prediction/${hash}`, {
    method: 'GET',
  })

  if (response.status < 400) {
    const predictionCensored = (await response.json()) as PredictionCensored
    return { props: { predictionCensored } }
  } else {
    context.res.statusCode = response.status
    return { props: {} }
  }
}

interface PredictionProps {
  predictionCensored?: PredictionCensored
}

export default function PredictionHash({ predictionCensored }: PredictionProps) {
  return (
    <GoBackWrapper>
      {predictionCensored ? (
        <Prediction prediction={predictionCensored} />
      ) : (
        <div>Prediction not found</div>
      )}
    </GoBackWrapper>
  )
}
