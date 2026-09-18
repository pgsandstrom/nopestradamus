import Link from 'next/link'

import MailPreview from '../../../components/mail-preview.tsx'
import { isAdminAuthenticated } from '../../../server/admin-session.ts'
import { renderMail } from '../../../server/mail/render.ts'
import { getCreaterAcceptMail } from '../../../server/mail/templates.ts'
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
      <p className={styles.summary}>
        Every prediction whose creater has not answered yet, with its accept mail as the mailer
        renders it right now. The unsubscribe footer is added when a mail is actually sent. For
        every mail the service can send, against fixtures rather than real rows, see{' '}
        <Link href="/dev/mails">/dev/mails</Link> on a dev server.
      </p>

      {pending.length === 0 ? (
        <p className={styles.empty}>No creater is keeping a prediction waiting.</p>
      ) : (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Title</th>
                  <th>Finishes</th>
                  <th>Creater</th>
                  <th>Accept mail</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((prediction) => (
                  <PendingMailRow key={prediction.hash} prediction={prediction} />
                ))}
              </tbody>
            </table>
          </div>

          {/* below the table rather than inside a cell: a mail is 600px wide and a table cell is
              whatever is left over */}
          {pending.map((prediction) => (
            <section key={prediction.hash} id={mailAnchor(prediction)} className={styles.preview}>
              <h3 className={styles.previewHeading}>
                {prediction.title}{' '}
                <span className={styles.previewTo}>{prediction.creater.mail}</span>
              </h3>
              <MailPreview mail={renderMail(getCreaterAcceptMail(prediction))} />
            </section>
          ))}
        </>
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
      <td className={styles.nowrap}>
        <a href={`#${mailAnchor(prediction)}`}>see the mail</a>
      </td>
    </tr>
  )
}

const mailAnchor = (prediction: Prediction): string => `mail-${prediction.hash}`

async function getPendingMails(): Promise<Prediction[]> {
  const hashes = await getPredictionsAwaitingCreater()
  const predictions = await Promise.all(hashes.map((hash) => getPrediction(hash)))

  return predictions.filter((prediction) => prediction !== undefined)
}
