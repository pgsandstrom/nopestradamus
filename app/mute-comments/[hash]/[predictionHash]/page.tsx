import GoBackWrapper from '../../../../components/go-back-wrapper.tsx'
import { getAccountByHash } from '../../../../server/account.ts'
import { isActivityMailMuted } from '../../../../server/activity-mute.ts'
import { getPrediction } from '../../../../server/prediction.ts'
import { getRoleForMail } from '../../../../shared/index.ts'
import MuteActivityControls from './mute-controls.tsx'

export const dynamic = 'force-dynamic'

interface MuteActivityPageProps {
  params: Promise<{ hash: string; predictionHash: string }>
}

/**
 * Where "Mute activity on this prediction" at the bottom of an activity mail lands. The path keeps
 * the `mute-comments` name it had before answer mails existed, because comment mails already sent
 * carry it. Keyed by the account hash like `/blockme`, so it works without logging in. The muting itself waits for a button, because
 * mail providers follow links in mails to scan them and a GET that muted would mute on arrival.
 */
export default async function MuteActivityPage({ params }: MuteActivityPageProps) {
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
      <MuteActivityControls
        hash={hash}
        predictionHash={predictionHash}
        mail={account.mail}
        title={prediction.title}
        initialMuted={await isActivityMailMuted(predictionHash, account.mail)}
      />
    </GoBackWrapper>
  )
}
