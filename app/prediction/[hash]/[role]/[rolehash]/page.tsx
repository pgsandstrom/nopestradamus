import GoBackWrapper from '../../../../../components/go-back-wrapper.tsx'
import { isRole } from '../../../../../shared/index.ts'
import { getCensoredPrediction, getPrediction } from '../../../../../server/prediction.ts'
import AnswerController from './answer-controller.tsx'

export const dynamic = 'force-dynamic'

interface AnswerPageProps {
  params: Promise<{ hash: string; role: string; rolehash: string }>
}

export default async function AnswerPredictionPage({ params }: AnswerPageProps) {
  const { hash: predictionHash, role, rolehash: roleHash } = await params

  const prediction = isRole(role) ? await getPrediction(predictionHash) : undefined
  if (prediction === undefined || !isRole(role)) {
    return (
      <GoBackWrapper>
        <p>Prediction not found</p>
      </GoBackWrapper>
    )
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
