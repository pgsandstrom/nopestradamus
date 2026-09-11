import GoBackWrapper from '../../../../../components/go-back-wrapper.tsx'
import { getCensoredPrediction, getPrediction } from '../../../../../server/prediction.ts'
import { isRole } from '../../../../../shared/index.ts'
import AnswerController from './answer-controller.tsx'

export const dynamic = 'force-dynamic'

interface AnswerPageProps {
  params: Promise<{ hash: string; role: string; rolehash: string }>
}

function NotFound() {
  return (
    <GoBackWrapper>
      <p>Prediction not found</p>
    </GoBackWrapper>
  )
}

export default async function AnswerPredictionPage({ params }: AnswerPageProps) {
  const { hash: predictionHash, role, rolehash: roleHash } = await params

  if (!isRole(role)) {
    return <NotFound />
  }

  const prediction = await getPrediction(predictionHash)
  if (prediction === undefined) {
    return <NotFound />
  }

  const predictionCensored = getCensoredPrediction(
    prediction,
    role === 'participant' ? roleHash : undefined,
  )

  return (
    <GoBackWrapper>
      <AnswerController
        prediction={predictionCensored}
        predictionHash={predictionHash}
        role={role}
        roleHash={roleHash}
      />
    </GoBackWrapper>
  )
}
