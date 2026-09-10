import GoBackWrapper from '../../components/go-back-wrapper.tsx'
import { isAdminPassword } from '../../server/admin-auth.ts'
import { getCreaterAcceptMail, type Mail } from '../../server/mailer.ts'
import { getCreaterNotAcceptedPredictions, getPrediction } from '../../server/prediction.ts'
import AdminConsole from './admin-console.tsx'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

interface AdminPageProps {
  searchParams: Promise<{ password?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { password } = await searchParams
  const passwordValid = password !== undefined && isAdminPassword(password)

  return (
    <GoBackWrapper>
      <AdminConsole />
      {passwordValid && <PendingAcceptMails />}
    </GoBackWrapper>
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
