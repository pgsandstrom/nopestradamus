import type { Comment, CommentView, Prediction } from '../shared/index.ts'
import { getMailFormatter, getRoleForMail } from '../shared/index.ts'
import { validateComment } from '../shared/validate-comment.ts'
import { query, SQL } from '../util/db.ts'
import { getCommentMailMutedMails } from './comment-mute.ts'
import { getCommentMail } from './mail/templates.ts'
import { sendMail } from './mailer.ts'

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

interface CommentMailRecipient {
  mail: string
  /** Their own creater or participant hash, for the login link in the mail. */
  roleHash: string
}

/**
 * Who hears about a new comment: everybody who has accepted the prediction, less its author and
 * less whoever muted its comments. Somebody who has not answered yet has not agreed to be part of anything,
 * and somebody who rejected has said they want out, so neither is mailed.
 *
 * An address on the prediction twice — creater and participant both — gets one mail, carrying the
 * creater hash, the same way `getRoleForMail` has creater win.
 */
export const getCommentMailRecipients = (
  prediction: Pick<Prediction, 'creater' | 'participants'>,
  authorMail: string,
  commentMutedMails: ReadonlySet<string>,
): CommentMailRecipient[] => {
  const recipients = new Map<string, CommentMailRecipient>()
  for (const person of [prediction.creater, ...prediction.participants]) {
    if (
      person.accepted === true &&
      person.mail !== authorMail &&
      !commentMutedMails.has(person.mail) &&
      !recipients.has(person.mail)
    ) {
      recipients.set(person.mail, { mail: person.mail, roleHash: person.hash })
    }
  }
  return [...recipients.values()]
}

/**
 * Mails a comment that has just been stored. There is no sent flag and no retry: a comment mail
 * that fails is logged and lost, which for a comment is better than the author seeing an error and
 * posting it a second time. One failed address does not stop the others.
 */
export const sendCommentMails = async (
  prediction: Prediction,
  authorMail: string,
  body: string,
): Promise<void> => {
  const recipients = getCommentMailRecipients(
    prediction,
    authorMail,
    await getCommentMailMutedMails(prediction.hash),
  )
  const results = await Promise.allSettled(
    recipients.map(({ mail, roleHash }) =>
      sendMail(mail, getCommentMail(prediction, authorMail, body.trim(), roleHash), {
        muteCommentsOf: prediction.hash,
      }),
    ),
  )
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`failed sending comment mail to ${recipients[index]!.mail}`, result.reason)
    }
  })
}
