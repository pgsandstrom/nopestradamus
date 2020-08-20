import { GetServerSideProps } from 'next'
import { PredictionCensored } from '../../shared'
import getServerUrl from '../../util/serverUrl'
import Prediction from '../../components/prediction'

export const getServerSideProps: GetServerSideProps<PredictionProps> = async (context) => {
  const hash = context.params!.hash as string
  const response = await fetch(`${getServerUrl()}/api/v1/prediction/${hash}`, {
    method: 'GET',
  })
  const predictionCensored = (await response.json()) as PredictionCensored
  return { props: { predictionCensored } }
}

interface PredictionProps {
  predictionCensored: PredictionCensored
}

export default function PredictionHash({ predictionCensored }: PredictionProps) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        paddingTop: '20px',
      }}
    >
      <Prediction prediction={predictionCensored} style={{ maxWidth: '600px' }} />
    </div>
  )
}
