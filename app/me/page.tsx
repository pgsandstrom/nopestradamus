import Link from 'next/link'

import GoBackWrapper from '../../components/go-back-wrapper.tsx'
import { StatusBadge } from '../../components/status-badge.tsx'
import { getPredictionsForMail } from '../../server/prediction.ts'
import { getCurrentUserMail } from '../../server/session-cookie.ts'
import { formatDateString } from '../../shared/date-util.ts'
import {
  getPredictionStatus,
  isAwaitingAnswerFrom,
  type PredictionListItem,
} from '../../shared/index.ts'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/**
 * Everything the visitor is part of, which is the one view that needs no secret link: the session
 * already names an address, and a prediction reaches it down either the creater or the
 * participant table. Private predictions are listed too — they are the visitor's own.
 */
export default async function MyPredictionsPage() {
  const mail = await getCurrentUserMail()

  if (mail === undefined) {
    return (
      <GoBackWrapper>
        <h1 className={styles.heading}>Your predictions</h1>
        <p className={styles.note}>
          You are not logged in. Put your address in at the top of the page and a login link will be
          mailed to you — or open the link from any prediction you are part of.
        </p>
      </GoBackWrapper>
    )
  }

  const predictions = await getPredictionsForMail(mail)
  const awaiting = predictions.filter(isAwaitingAnswerFrom)

  return (
    <GoBackWrapper>
      <h1 className={styles.heading}>Your predictions</h1>
      <p className={styles.note}>Everything {mail} is part of.</p>

      {awaiting.length > 0 && (
        <p className={styles.callout}>
          {awaiting.length === 1
            ? 'One of these is waiting for your answer.'
            : `${awaiting.length} of these are waiting for your answer.`}
        </p>
      )}

      {predictions.length === 0 ? (
        <p className={styles.note}>
          Nothing here yet. Predictions you create, and predictions you are invited to, show up on
          this page.
        </p>
      ) : (
        <ul className={styles.list}>
          {predictions.map((prediction) => (
            <PredictionRow key={prediction.hash} prediction={prediction} />
          ))}
        </ul>
      )}
    </GoBackWrapper>
  )
}

function PredictionRow({ prediction }: { prediction: PredictionListItem }) {
  const awaiting = isAwaitingAnswerFrom(prediction)

  return (
    <li className={[styles.row, awaiting ? styles.awaiting : undefined].filter(Boolean).join(' ')}>
      <Link className={styles.title} href={`/prediction/${prediction.hash}`}>
        {prediction.title}
      </Link>
      <div className={styles.meta}>
        <StatusBadge
          status={getPredictionStatus(prediction.creater_accepted, prediction.finish_date)}
        />
        <span>you are the {prediction.role}</span>
        <span>finishes {formatDateString(prediction.finish_date)}</span>
        <OwnAnswer prediction={prediction} awaiting={awaiting} />
      </div>
    </li>
  )
}

function OwnAnswer({
  prediction,
  awaiting,
}: {
  prediction: PredictionListItem
  awaiting: boolean
}) {
  if (prediction.own_answer === true) {
    return <span>you accepted</span>
  }
  if (prediction.own_answer === false) {
    return <span>you rejected</span>
  }
  // a participant is not asked anything until the creater has accepted, so "not answered" is
  // only worth pointing at once the question has actually reached them
  return awaiting ? (
    <strong className={styles.answerNeeded}>waiting for your answer</strong>
  ) : (
    <span>you have not answered</span>
  )
}
