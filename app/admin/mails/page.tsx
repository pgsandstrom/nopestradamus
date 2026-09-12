import Link from 'next/link'

import { isAdminAuthenticated } from '../../../server/admin-session.ts'
import { getCreaterAcceptMail, type Mail } from '../../../server/mailer.ts'
import { getCreaterNotAcceptedPredictions, getPrediction } from '../../../server/prediction.ts'
import { formatDateString, formatDateTimeString } from '../../../shared/date-util.ts'
import type { Prediction } from '../../../shared/index.ts'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

interface PendingMail {
  prediction: Prediction
  mail: Mail
}

export default async function AdminMailsPage() {
  // the layout renders the login form instead of this page, but it does not re-render on a
  // client-side navigation, so the page checks for itself rather than inheriting the answer
  if (!(await isAdminAuthenticated())) {
    return null
  }

  const pending = await getPendingMails()

  return (
    <section>
      <h2 className={styles.heading}>Pending creater accept mails ({pending.length})</h2>
      <p className={styles.summary}>
        The accept mail of every prediction whose creater has not answered yet, as the mailer
        renders it right now. The unsubscribe footer is added when a mail is actually sent.
      </p>

      {pending.length === 0 ? (
        <p className={styles.empty}>No creater is keeping a prediction waiting.</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Created</th>
                <th>Title</th>
                <th>Finishes</th>
                <th>Creater</th>
                <th>Accept mail</th>
                <th>Mail</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((row) => (
                <PendingMailRow key={row.prediction.hash} pending={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PendingMailRow({ pending: { prediction, mail } }: { pending: PendingMail }) {
  return (
    <tr>
      <td className={styles.nowrap}>{formatDateTimeString(prediction.created)}</td>
      <td>
        <Link href={`/admin/predictions/${prediction.hash}`}>{prediction.title}</Link>
      </td>
      <td className={styles.nowrap}>{formatDateString(prediction.finish_date)}</td>
      <td>{prediction.creater.mail}</td>
      <td className={styles.nowrap}>
        <span className={prediction.creater.accepted_mail_sent ? styles.sent : styles.unsent}>
          {prediction.creater.accepted_mail_sent ? 'sent' : 'not sent'}
        </span>
      </td>
      <td>
        <details className={styles.mail}>
          <summary className={styles.mailSummary}>{mail.title}</summary>
          <p className={styles.mailBody}>{mail.body}</p>
        </details>
      </td>
    </tr>
  )
}

async function getPendingMails(): Promise<PendingMail[]> {
  const hashes = await getCreaterNotAcceptedPredictions()
  const predictions = await Promise.all(hashes.map((hash) => getPrediction(hash)))

  return predictions
    .filter((prediction) => prediction !== undefined)
    .map((prediction) => ({ prediction, mail: getCreaterAcceptMail(prediction) }))
}
