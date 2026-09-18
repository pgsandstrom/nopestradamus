import { notFound } from 'next/navigation'

import MailPreview from '../../../components/mail-preview.tsx'
import { MAIL_SAMPLES } from '../../../server/mail/fixtures.ts'
import { renderMail } from '../../../server/mail/render.ts'
import { isDev } from '../../../util/env.ts'
import styles from './page.module.css'

/**
 * Every mail the service sends, side by side, against fixtures.
 *
 * Dev only, and deliberately not behind the admin cookie: this is a page for looking at a design
 * while changing it, so it must not need a login, a prediction in the database or a mail account
 * to be useful. `notFound()` rather than a redirect, so the route simply does not exist in
 * production.
 */
export default function DevMailsPage() {
  if (!isDev()) {
    notFound()
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mail previews</h1>
        <p className={styles.lead}>
          Every mail the service sends, rendered from the same templates the mailer uses, against
          the fixtures in <code>server/mail/fixtures.ts</code>. The unsubscribe footer is included,
          because it is part of what lands in the inbox.
        </p>
        <nav className={styles.index}>
          {MAIL_SAMPLES.map((sample) => (
            <a key={sample.id} className={styles.indexLink} href={`#${sample.id}`}>
              {sample.name}
            </a>
          ))}
        </nav>
      </header>

      {MAIL_SAMPLES.map((sample) => (
        <section key={sample.id} id={sample.id} className={styles.sample}>
          <h2 className={styles.sampleName}>{sample.name}</h2>
          <p className={styles.sampleDescription}>{sample.description}</p>
          <MailPreview mail={renderMail(sample.mail)} />
        </section>
      ))}
    </main>
  )
}
