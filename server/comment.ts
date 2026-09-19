import type { Comment, CommentCensored, Prediction } from '../shared/index.ts'
import { getRoleForMail } from '../shared/index.ts'
import { censorMail } from '../shared/mail-util.ts'
import { validateComment } from '../shared/validate-comment.ts'
import { query, SQL } from '../util/db.ts'

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
 * Strips the author's address down to what the prediction page shows for everyone else, and
 * works out what the author is to the prediction from the prediction as it stands now.
 */
export const getCensoredComments = (
  prediction: Pick<Prediction, 'creater' | 'participants'>,
  comments: Comment[],
  currentUserMail?: string,
): CommentCensored[] =>
  comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    created: comment.created,
    mail: censorMail(comment.mail),
    role: getRoleForMail(prediction, comment.mail),
    isCurrentUser: comment.mail === currentUserMail,
  }))
