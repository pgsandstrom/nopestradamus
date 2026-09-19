import type { Prediction } from '../shared/index.ts'
import { getActivityMailMutedMails } from './activity-mute.ts'
import type { MailDocument } from './mail/blocks.ts'
import { sendMail } from './mailer.ts'

interface ActivityMailRecipient {
  mail: string
  /** Their own creater or participant hash, for the login link in the mail. */
  roleHash: string
}

/**
 * Who hears about something happening on a prediction — a comment, somebody answering it:
 * everybody who has accepted the prediction, less whoever did it and less whoever muted its
 * activity. Somebody who has not answered yet has not agreed to be part of anything, and somebody
 * who rejected has said they want out, so neither is mailed.
 */
export const getActivityMailRecipients = (
  prediction: Pick<Prediction, 'creater' | 'participants'>,
  actorMail: string,
  mutedMails: ReadonlySet<string>,
): ActivityMailRecipient[] =>
  [prediction.creater, ...prediction.participants]
    .filter(
      (person) =>
        person.accepted === true && person.mail !== actorMail && !mutedMails.has(person.mail),
    )
    .map((person) => ({ mail: person.mail, roleHash: person.hash }))

/**
 * Mails something that has just happened on a prediction to {@link getActivityMailRecipients}.
 * There is no sent flag and no retry: an activity mail that fails is logged and lost, which is
 * better than the actor seeing an error for something that did happen and doing it a second
 * time. One failed address does not stop the others.
 */
export const sendActivityMails = async (
  prediction: Prediction,
  actorMail: string,
  getMail: (recipientRoleHash: string) => MailDocument,
): Promise<void> => {
  const recipients = getActivityMailRecipients(
    prediction,
    actorMail,
    await getActivityMailMutedMails(prediction.hash),
  )
  const results = await Promise.allSettled(
    recipients.map(({ mail, roleHash }) =>
      sendMail(mail, getMail(roleHash), { muteActivityOf: prediction.hash }),
    ),
  )
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`failed sending activity mail to ${recipients[index]!.mail}`, result.reason)
    }
  })
}
