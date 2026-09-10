import GoBackWrapper from '../../../components/go-back-wrapper.tsx'
import Prediction from '../../../components/prediction.tsx'
import { getCensoredPrediction, getPrediction } from '../../../server/prediction.ts'

export const dynamic = 'force-dynamic'

interface PredictionPageProps {
  params: Promise<{ hash: string }>
}

export default async function PredictionPage({ params }: PredictionPageProps) {
  const { hash } = await params
  const prediction = await getPrediction(hash)

  return (
    <GoBackWrapper>
      {prediction === undefined ? (
        <p>Prediction not found</p>
      ) : (
        <Prediction prediction={getCensoredPrediction(prediction)} />
      )}
    </GoBackWrapper>
  )
}
