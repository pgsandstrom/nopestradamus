import GoBackWrapper from '../../../../components/go-back-wrapper.tsx'
import { getAccountByHash } from '../../../../server/account.ts'
import { isCommentMailMuted } from '../../../../server/comment-mute.ts'
import { getPrediction } from '../../../../server/prediction.ts'
import { getRoleForMail } from '../../../../shared/index.ts'
import MuteCommentsControls from './mute-controls.tsx'

export const dynamic = 'force-dynamic'

interface MuteCommentsPageProps {
  params: Promise<{ hash: string; predictionHash: string }>
}

/**
 * Where "Mute comments on this prediction" at the bottom of a comment mail lands. Keyed by the account hash
 * like `/blockme`, so it works without logging in. The muting itself waits for a button, because
 * mail providers follow links in mails to scan them and a GET that muted would mute on arrival.
 */
export default async function MuteCommentsPage({ params }: MuteCommentsPageProps) {
  const { hash, predictionHash } = await params
  const [account, prediction] = await Promise.all([
    getAccountByHash(hash),
    getPrediction(predictionHash),
  ])

  if (
    account === undefined ||
    prediction === undefined ||
    getRoleForMail(prediction, account.mail) === undefined
  ) {
    return (
      <GoBackWrapper>
        <p>Prediction not found</p>
      </GoBackWrapper>
    )
  }

  return (
    <GoBackWrapper>
      <MuteCommentsControls
        hash={hash}
        predictionHash={predictionHash}
        mail={account.mail}
        title={prediction.title}
        initialMuted={await isCommentMailMuted(predictionHash, account.mail)}
      />
    </GoBackWrapper>
  )
}
