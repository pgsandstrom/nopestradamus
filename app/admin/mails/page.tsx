import Link from 'next/link'

import { isAdminAuthenticated } from '../../../server/admin-session.ts'
import { getPrediction, getPredictionsAwaitingCreater } from '../../../server/prediction.ts'
import { formatDateString, formatDateTimeString } from '../../../shared/date-util.ts'
import type { Prediction } from '../../../shared/index.ts'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminMailsPage() {
  // the layout renders the login form instead of this page, but it does not re-render on a
  // client-side navigation, so the page checks for itself rather than inheriting the answer
  if (!(await isAdminAuthenticated())) {
    return null
  }

  const pending = await getPendingMails()

  return (
    <section>
      <h2 className={styles.heading}>Awaiting creater ({pending.length})</h2>
      <p className={styles.summary}>Every prediction whose creater has not answered yet.</p>

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
              </tr>
            </thead>
            <tbody>
              {pending.map((prediction) => (
                <PendingMailRow key={prediction.hash} prediction={prediction} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PendingMailRow({ prediction }: { prediction: Prediction }) {
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
    </tr>
  )
}

async function getPendingMails(): Promise<Prediction[]> {
  const hashes = await getPredictionsAwaitingCreater()
  const predictions = await Promise.all(hashes.map((hash) => getPrediction(hash)))

  return predictions.filter((prediction) => prediction !== undefined)
}
