import Link from 'next/link'

import { StatusBadge } from '../../../components/status-badge.tsx'
import { isAdminAuthenticated } from '../../../server/admin-session.ts'
import { adminGetAnsweredPredictions, adminGetOrphanedRows } from '../../../server/prediction.ts'
import { formatDateString, formatDateTimeString } from '../../../shared/date-util.ts'
import {
  getPredictionStatus,
  type OrphanedRow,
  type PredictionAdminListItem,
  type PredictionStatus,
} from '../../../shared/index.ts'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminPredictionsPage() {
  // the layout renders the login form instead of this page, but it does not re-render on a
  // client-side navigation, so the page checks for itself rather than inheriting the answer
  if (!(await isAdminAuthenticated())) {
    return null
  }

  const [predictions, orphanedRows] = await Promise.all([
    adminGetAnsweredPredictions(),
    adminGetOrphanedRows(),
  ])

  return (
    <section>
      <h2 className={styles.heading}>Answered predictions ({predictions.length})</h2>
      <Summary predictions={predictions} />

      {predictions.length === 0 ? (
        <p className={styles.empty}>No creater has answered yet.</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Created</th>
                <th>Title</th>
                <th>Finishes</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Creater</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction) => (
                <PredictionRow key={prediction.hash} prediction={prediction} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrphanedRows rows={orphanedRows} />
    </section>
  )
}

function Summary({ predictions }: { predictions: PredictionAdminListItem[] }) {
  const count = (status: PredictionStatus) =>
    predictions.filter((p) => statusOf(p) === status).length
  const privateCount = predictions.filter((p) => !p.public).length
  // the predictions awaiting an answer live on /admin/mails, so a row left without one here is a
  // broken one with no creater row at all
  const missingCreaterCount = count('awaiting creater')

  return (
    <p className={styles.summary}>
      {count('running')} running · {count('finished')} finished · {count('rejected')} rejected ·{' '}
      {privateCount} private
      {missingCreaterCount > 0 && ` · ${missingCreaterCount} with no creater row`}
    </p>
  )
}

function PredictionRow({ prediction }: { prediction: PredictionAdminListItem }) {
  return (
    <tr>
      <td className={styles.nowrap}>{formatDateTimeString(prediction.created)}</td>
      <td>
        <Link href={`/admin/predictions/${prediction.hash}`}>{prediction.title}</Link>
      </td>
      <td className={styles.nowrap}>{formatDateString(prediction.finish_date)}</td>
      <td>
        <StatusBadge status={statusOf(prediction)} />
      </td>
      <td>{prediction.public ? 'public' : 'private'}</td>
      <td>{prediction.creater_mail ?? <span className={styles.missing}>no creater row</span>}</td>
      <td className={styles.nowrap}>
        {prediction.participant_count === 0
          ? 'none'
          : `${prediction.participant_accepted_count}/${prediction.participant_count} accepted`}
        {prediction.participant_rejected_count > 0 &&
          `, ${prediction.participant_rejected_count} rejected`}
      </td>
    </tr>
  )
}

function OrphanedRows({ rows }: { rows: OrphanedRow[] }) {
  if (rows.length === 0) {
    return null
  }

  return (
    <section className={styles.orphans}>
      <h2 className={styles.heading}>Orphaned rows ({rows.length})</h2>
      <p className={styles.summary}>
        Creater and participant rows left pointing at a prediction that no longer exists.
      </p>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Role</th>
              <th>Mail</th>
              <th>Prediction hash</th>
              <th>Row hash</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.hash}>
                <td>{row.role}</td>
                <td>{row.mail}</td>
                <td className={styles.hash}>{row.prediction_hash}</td>
                <td className={styles.hash}>{row.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const statusOf = (prediction: PredictionAdminListItem): PredictionStatus =>
  getPredictionStatus(prediction.creater_accepted, prediction.finish_date)
