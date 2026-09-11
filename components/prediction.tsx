import { formatDateString } from '../shared/date-util.ts'
import type { PredictionCensored } from '../shared/index.ts'
import styles from './prediction.module.css'

interface PredictionProps {
  prediction: PredictionCensored
  suppressNotAcceptedWarning?: boolean
}

export default function Prediction({ prediction, suppressNotAcceptedWarning }: PredictionProps) {
  return (
    <section>
      {prediction.creater.accepted !== true && suppressNotAcceptedWarning !== true && (
        <p className={styles.warning}>
          NOTICE: This prediction has not yet been accepted by the creater, therefore it is set to
          private and not shown anywhere else on the page.
        </p>
      )}
      <h1 className={styles.title}>{prediction.title}</h1>
      <p className={styles.created}>created on {formatDateString(prediction.created)}</p>
      <p className={styles.body}>{prediction.body}</p>
      <p className={styles.finish}>
        The prediction finishes on {formatDateString(prediction.finish_date)}
      </p>
      <h2 className={styles.participantsHeading}>Participants</h2>
      <ul className={styles.participantList}>
        <ParticipantRow
          accepted={prediction.creater.accepted}
          name={prediction.creater.mail}
          extraText="(creater)"
        />
        {prediction.participants.map((p) => (
          <ParticipantRow key={p.mail} accepted={p.accepted} name={p.mail} />
        ))}
      </ul>
    </section>
  )
}

interface ParticipantRowProps {
  accepted?: boolean
  name: string
  extraText?: string
}

function ParticipantRow({ accepted, name, extraText }: ParticipantRowProps) {
  return (
    <li className={styles.participant}>
      <StatusBox accepted={accepted} />
      <span>{name}</span>
      {extraText !== undefined && <span className={styles.note}>{extraText}</span>}
      {accepted === undefined && <span className={styles.note}>(waiting for confirmation)</span>}
    </li>
  )
}

function StatusBox({ accepted }: { accepted?: boolean }) {
  const label =
    accepted === true ? 'Accepted' : accepted === false ? 'Rejected' : 'Awaiting response'
  const className = [
    styles.status,
    accepted === true ? styles.accepted : undefined,
    accepted === false ? styles.rejected : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      role="img"
      aria-label={label}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      {accepted === true && <polyline points="7.5 12.5 10.5 15.5 16.5 8.5" />}
      {accepted === false && <path d="M8 8 L16 16 M16 8 L8 16" />}
    </svg>
  )
}
