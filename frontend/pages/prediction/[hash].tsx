import { GetServerSideProps } from 'next'
import { PredictionCensored } from '../../shared'
import getServerUrl from '../../util/serverUrl'

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

export default function Prediction({ predictionCensored }: PredictionProps) {
  return <div>{predictionCensored.body}</div>
}
