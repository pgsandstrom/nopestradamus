import Link from 'next/link'
import type { ReactNode } from 'react'

import { isAdminAuthenticated } from '../../../../server/admin-session.ts'
import {
  getCreaterAcceptMail,
  getCreaterEndMail,
  getParticipantAcceptMail,
  getParticipantEndMail,
  type Mail,
} from '../../../../server/mailer.ts'
import { adminGetPrediction } from '../../../../server/prediction.ts'
import { formatDateString, formatDateTimeString } from '../../../../shared/date-util.ts'
import {
  type AdminAccount,
  type Creater,
  getPredictionStatus,
  type Participant,
  type Prediction,
  type PredictionAdmin,
  type Role,
} from '../../../../shared/index.ts'
import { StatusBadge } from '../status-badge.tsx'
import DeletePrediction from './delete-prediction.tsx'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

interface AdminPredictionPageProps {
  params: Promise<{ hash: string }>
}

export default async function AdminPredictionPage({ params }: AdminPredictionPageProps) {
  // the layout renders the login form instead of this page, but it does not re-render on a
  // client-side navigation, so the page checks for itself rather than inheriting the answer
  if (!(await isAdminAuthenticated())) {
    return null
  }

  const { hash } = await params
  const detail = await adminGetPrediction(hash)

  return (
    <section>
      <Link className={styles.back} href="/admin/predictions">
        ← All predictions
      </Link>
      {detail === undefined ? (
        <p>No prediction with hash {hash}</p>
      ) : (
        <PredictionDetail detail={detail} />
      )}
    </section>
  )
}

function PredictionDetail({ detail }: { detail: PredictionAdmin }) {
  const { prediction, creater, participants, accounts } = detail
  const accountFor = (mail: string) => accounts.find((account) => account.mail === mail)

  return (
    <>
      <header className={styles.header}>
        <h2 className={styles.title}>{prediction.title}</h2>
        <StatusBadge status={getPredictionStatus(creater?.accepted, prediction.finish_date)} />
      </header>

      <h3 className={styles.sectionHeading}>Prediction</h3>
      <dl className={styles.fields}>
        <Field label="hash">
          <span className={styles.hash}>{prediction.hash}</span>
        </Field>
        <Field label="created">{formatDateTimeString(prediction.created)}</Field>
        <Field label="finish date">{formatDateString(prediction.finish_date)}</Field>
        <Field label="public">{prediction.public ? 'yes' : 'no'}</Field>
        <Field label="creator_validated">{prediction.creator_validated ? 'yes' : 'no'}</Field>
        <Field label="public page">
          <Link href={`/prediction/${prediction.hash}`}>/prediction/{prediction.hash}</Link>
        </Field>
      </dl>
      <p className={styles.body}>{prediction.body}</p>

      <h3 className={styles.sectionHeading}>
        People ({participants.length + (creater === undefined ? 0 : 1)})
      </h3>
      {creater === undefined ? (
        <p className={styles.missing}>
          This prediction has no creater row. Every mail about it is stuck until that is fixed.
        </p>
      ) : (
        <PersonCard
          predictionHash={prediction.hash}
          role="creater"
          person={creater}
          account={accountFor(creater.mail)}
        />
      )}
      {participants.map((participant) => (
        <PersonCard
          key={participant.hash}
          predictionHash={prediction.hash}
          role="participant"
          person={participant}
          account={accountFor(participant.mail)}
        />
      ))}
      {participants.length === 0 && <p className={styles.note}>No participants.</p>}

      <h3 className={styles.sectionHeading}>Mails</h3>
      <p className={styles.note}>
        Every mail this prediction can produce, as the mailer renders it right now. The unsubscribe
        footer is added when a mail is actually sent.
      </p>
      {creater === undefined ? (
        <p className={styles.note}>No mails without a creater row.</p>
      ) : (
        <PredictionMails prediction={toPrediction(detail, creater)} creater={creater} />
      )}

      <h3 className={styles.sectionHeading}>Danger zone</h3>
      <DeletePrediction
        hash={prediction.hash}
        title={prediction.title}
        participantCount={participants.length}
      />
    </>
  )
}

interface PersonCardProps {
  predictionHash: string
  role: Role
  person: Creater | Participant
  account?: AdminAccount
}

function PersonCard({ predictionHash, role, person, account }: PersonCardProps) {
  return (
    <article className={styles.person}>
      <h4 className={styles.personHeading}>
        {person.mail} <span className={styles.note}>({role})</span>
      </h4>
      <dl className={styles.fields}>
        <Field label="accepted">
          <Bool value={person.accepted} yes="accepted" no="rejected" unknown="not answered" />
        </Field>
        <Field label="accepted date">
          {person.accepted_date === undefined ? (
            <span className={styles.note}>never</span>
          ) : (
            formatDateTimeString(person.accepted_date)
          )}
        </Field>
        <Field label="accept mail">
          <Sent value={person.accepted_mail_sent} />
        </Field>
        <Field label="end mail">
          <Sent value={person.end_mail_sent} />
        </Field>
        <Field label="hash">
          <span className={styles.hash}>{person.hash}</span>
        </Field>
        <Field label="answer page">
          <Link href={`/prediction/${predictionHash}/${role}/${person.hash}`}>
            /prediction/{predictionHash}/{role}/{person.hash}
          </Link>
        </Field>
        <Field label="account">
          {account === undefined ? (
            <span className={styles.missing}>no row in the mail table</span>
          ) : (
            <>
              <Bool value={account.validated} yes="validated" no="not validated" />
              {', '}
              <Bool value={account.blocked} yes="blocked" no="not blocked" invert />
            </>
          )}
        </Field>
        {account !== undefined && (
          <Field label="block page">
            <Link href={`/blockme/${account.hash}`}>/blockme/{account.hash}</Link>
          </Field>
        )}
      </dl>
    </article>
  )
}

function PredictionMails({ prediction, creater }: { prediction: Prediction; creater: Creater }) {
  return (
    <>
      <MailBlock
        heading={`Creater accept mail → ${creater.mail}`}
        mail={getCreaterAcceptMail(prediction)}
        sent={creater.accepted_mail_sent}
      />
      {prediction.participants.map((participant) => (
        <MailBlock
          key={`accept-${participant.hash}`}
          heading={`Participant accept mail → ${participant.mail}`}
          mail={getParticipantAcceptMail(prediction, participant)}
          sent={participant.accepted_mail_sent}
        />
      ))}
      <MailBlock
        heading={`Creater end mail → ${creater.mail}`}
        mail={getCreaterEndMail(prediction)}
        sent={creater.end_mail_sent}
      />
      {prediction.participants.map((participant) => (
        <MailBlock
          key={`end-${participant.hash}`}
          heading={`Participant end mail → ${participant.mail}`}
          mail={getParticipantEndMail(prediction, participant)}
          sent={participant.end_mail_sent}
        />
      ))}
    </>
  )
}

function MailBlock({ heading, mail, sent }: { heading: string; mail: Mail; sent: boolean }) {
  return (
    <details className={styles.mail}>
      <summary className={styles.mailSummary}>
        <span>{heading}</span>
        <Sent value={sent} />
      </summary>
      <p className={styles.mailTitle}>{mail.title}</p>
      <p className={styles.mailBody}>{mail.body}</p>
    </details>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className={styles.term}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </>
  )
}

interface BoolProps {
  value?: boolean
  yes: string
  no: string
  unknown?: string
  /** For flags where true is the bad news, such as a blocked account. */
  invert?: boolean
}

function Bool({ value, yes, no, unknown = 'unknown', invert }: BoolProps) {
  if (value === undefined) {
    return <span className={styles.note}>{unknown}</span>
  }
  const isGood = invert === true ? !value : value
  return <span className={isGood ? styles.good : styles.bad}>{value ? yes : no}</span>
}

function Sent({ value }: { value: boolean }) {
  return <span className={value ? styles.good : styles.note}>{value ? 'sent' : 'not sent'}</span>
}

/** The shape the mailer wants, built from the rows the admin query already read. */
const toPrediction = (detail: PredictionAdmin, creater: Creater): Prediction => ({
  created: detail.prediction.created,
  title: detail.prediction.title,
  body: detail.prediction.body,
  hash: detail.prediction.hash,
  finish_date: detail.prediction.finish_date,
  creater,
  participants: detail.participants,
})
