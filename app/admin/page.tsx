import { isAdminAuthenticated } from '../../server/admin-session.ts'
import { getCreaterAcceptMail, type Mail } from '../../server/mailer.ts'
import { getCreaterNotAcceptedPredictions, getPrediction } from '../../server/prediction.ts'
import AdminConsole from './admin-console.tsx'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // the layout renders the login form instead of this page, but it does not re-render on a
  // client-side navigation, so the page checks for itself rather than inheriting the answer
  if (!(await isAdminAuthenticated())) {
    return null
  }

  return (
    <>
      <AdminConsole />
      <PendingAcceptMails />
    </>
  )
}

async function PendingAcceptMails() {
  const acceptMails: Mail[] = []
  for (const predictionHash of await getCreaterNotAcceptedPredictions()) {
    const prediction = await getPrediction(predictionHash)
    if (prediction) {
      acceptMails.push(getCreaterAcceptMail(prediction))
    }
  }

  return (
    <section className={styles.mails}>
      <h2>Pending creater accept mails ({acceptMails.length})</h2>
      {acceptMails.map((acceptMail) => (
        <article key={acceptMail.body} className={styles.mail}>
          <h3>{acceptMail.title}</h3>
          <p className={styles.mailBody}>{acceptMail.body}</p>
        </article>
      ))}
    </section>
  )
}
