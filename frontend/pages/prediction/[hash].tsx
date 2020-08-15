import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps<PredictionProps> = async (context) => {
  const hash = context.params!.hash as string
  const response = await fetch(`http://localhost:8088/api/v1/prediction/${hash}`, {
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
