import { formatDateTimeString } from '../../../shared/date-util.ts'
import type { CommentView } from '../../../shared/index.ts'
import ActivityMuteToggle from './activity-mute-toggle.tsx'
import CommentForm from './comment-form.tsx'
import styles from './comments.module.css'

interface CommentsProps {
  comments: CommentView[]
  predictionHash: string
  /** Whether to offer the form. The action decides again when a comment arrives. */
  canWrite: boolean
  /** Whether the viewer muted activity mails here; undefined when they would get none anyway. */
  activityMuted?: boolean | undefined
}

export default function Comments({
  comments,
  predictionHash,
  canWrite,
  activityMuted,
}: CommentsProps) {
  return (
    <section className={styles.comments}>
      <h2 className={styles.heading}>Comments</h2>
      {comments.length === 0 ? (
        <p className={styles.empty}>No comments yet.</p>
      ) : (
        <ol className={styles.list}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.comment}>
              <p className={styles.meta}>
                <span className={styles.author}>
                  {comment.isCurrentUser ? 'You' : comment.mail}
                </span>
                {comment.role === 'creater' && <span>(creater)</span>}
                <span>{formatDateTimeString(comment.created)}</span>
              </p>
              <p className={styles.body}>{comment.body}</p>
            </li>
          ))}
        </ol>
      )}
      {canWrite && <CommentForm predictionHash={predictionHash} />}
      {activityMuted !== undefined && (
        <ActivityMuteToggle predictionHash={predictionHash} muted={activityMuted} />
      )}
    </section>
  )
}
