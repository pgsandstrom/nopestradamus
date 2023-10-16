import { GetServerSideProps } from 'next'
import { PredictionCensored } from '../../shared'
import Prediction from '../../components/prediction'
import GoBackWrapper from '../../components/goBackWrapper'
import { getCensoredPrediction, getPrediction } from '../../server/prediction'

export const getServerSideProps: GetServerSideProps<PredictionProps> = async (context) => {
  const hash = context.params!.hash as string
  const prediction = await getPrediction(hash)
  if (!prediction) {
    return { props: {} }
  }
  const predictionCensored = getCensoredPrediction(prediction)
  return { props: { predictionCensored } }
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
