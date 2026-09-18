import type { PredictionStatus } from '../shared/index.ts'
import styles from './status-badge.module.css'

const STATUS_STYLE: Record<PredictionStatus, string | undefined> = {
  running: styles.running,
  finished: styles.finished,
  rejected: styles.rejected,
  'awaiting creater': styles.awaiting,
}

export function StatusBadge({ status }: { status: PredictionStatus }) {
  return (
    <span className={[styles.badge, STATUS_STYLE[status]].filter(Boolean).join(' ')}>{status}</span>
  )
}
