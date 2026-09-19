import type { Comment, CommentView, Prediction } from '../shared/index.ts'
import { getMailFormatter, getRoleForMail } from '../shared/index.ts'
import { validateComment } from '../shared/validate-comment.ts'
import { query, SQL } from '../util/db.ts'
import { sendActivityMails } from './activity-mail.ts'
import { getCommentMail } from './mail/templates.ts'

/** Oldest first, so the list reads as the conversation it is. `id` breaks ties within a second. */
export const getComments = async (predictionHash: string): Promise<Comment[]> => {
  const cursor = await query<Comment>(
    SQL`SELECT id, prediction_hash, mail, body, created FROM comment
WHERE prediction_hash = ${predictionHash}
ORDER BY created, id`,
  )
  return cursor.rows
}

/**
 * Stores a comment as written by `mail`. Deciding whether that address may comment here is the
 * caller's job, through `canWriteComments`, which keeps the policy in one place.
 */
export const createComment = async (
  predictionHash: string,
  mail: string,
  body: string,
): Promise<void> => {
  if (!validateComment(body)) {
    throw new Error('Invalid comment')
  }
  await query(
    SQL`INSERT INTO comment (prediction_hash, mail, body) VALUES (${predictionHash}, ${mail}, ${body.trim()})`,
  )
}

/**
 * Shows the author's address the way the prediction page shows it to this viewer, and works out
 * what the author is to the prediction from the prediction as it stands now.
 */
export const getCommentViews = (
  prediction: Pick<Prediction, 'creater' | 'participants'>,
  comments: Comment[],
  currentUserMail?: string,
): CommentView[] => {
  const formatMail = getMailFormatter(prediction, currentUserMail)
  return comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    created: comment.created,
    mail: formatMail(comment.mail),
    role: getRoleForMail(prediction, comment.mail),
    isCurrentUser: comment.mail === currentUserMail,
  }))
}

/** Mails a comment that has just been stored to everybody else on the prediction. */
export const sendCommentMails = (
  prediction: Prediction,
  authorMail: string,
  body: string,
): Promise<void> =>
  sendActivityMails(prediction, authorMail, (roleHash) =>
    getCommentMail(prediction, authorMail, body.trim(), roleHash),
  )
