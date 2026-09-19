import GoBackWrapper from '../../../components/go-back-wrapper.tsx'
import Prediction from '../../../components/prediction.tsx'
import { isActivityMailMuted } from '../../../server/activity-mute.ts'
import { getComments, getCommentViews } from '../../../server/comment.ts'
import { getPrediction, getPredictionView } from '../../../server/prediction.ts'
import { getCurrentUserMail } from '../../../server/session-cookie.ts'
import { canWriteComments, getRoleForMail } from '../../../shared/index.ts'
import AnswerController from './answer-controller.tsx'
import Comments from './comments.tsx'

export const dynamic = 'force-dynamic'

interface PredictionPageProps {
  params: Promise<{ hash: string }>
}

/**
 * The only prediction page there is. What a visitor gets depends on the session rather than on
 * the URL: a creater or participant is offered the accept/reject buttons and the comment form,
 * everybody else reads the same view the front page links to, comments included. The mails are
 * shown in full to whoever is part of the prediction and censored for everyone else.
 */
export default async function PredictionPage({ params }: PredictionPageProps) {
  const { hash } = await params
  const [prediction, mail, comments] = await Promise.all([
    getPrediction(hash),
    getCurrentUserMail(),
    getComments(hash),
  ])

  if (prediction === undefined) {
    return (
      <GoBackWrapper>
        <p>Prediction not found</p>
      </GoBackWrapper>
    )
  }

  const role = mail === undefined ? undefined : getRoleForMail(prediction, mail)
  const predictionView = getPredictionView(prediction, mail)
  // only somebody on the prediction is ever mailed about its activity
  const activityMuted =
    mail === undefined || role === undefined ? undefined : await isActivityMailMuted(hash, mail)

  return (
    <GoBackWrapper>
      {role === undefined ? (
        <Prediction prediction={predictionView} />
      ) : (
        <AnswerController prediction={predictionView} predictionHash={hash} role={role} />
      )}
      <Comments
        comments={getCommentViews(prediction, comments, mail)}
        predictionHash={hash}
        canWrite={canWriteComments(prediction, mail)}
        activityMuted={activityMuted}
      />
    </GoBackWrapper>
  )
}
