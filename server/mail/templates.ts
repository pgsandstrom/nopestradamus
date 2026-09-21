import { formatDateString } from '../../shared/date-util.ts'
import type { Participant, Prediction, PredictionHealth } from '../../shared/index.ts'
import { LOGIN_TOKEN_TTL_SECONDS } from '../login-token.ts'
import type { Block, MailDocument } from './blocks.ts'
import { SITE_URL } from './site.ts'

/**
 * The recipient's own link to a prediction. The role hash rides in the fragment, which browsers
 * never send to a server: the secret stays out of access logs, out of the Referer header and out
 * of whatever scanner the recipient's mail provider points at the link. The page trades it for a
 * session cookie and then wipes it from the address bar.
 */
const predictionUrl = (predictionHash: string, roleHash: string): string =>
  `${SITE_URL}/prediction/${predictionHash}#${roleHash}`

/**
 * The mail behind the header's "continue with e-mail" form. Same fragment trick as a prediction
 * link, and here it earns its keep twice over: a link scanner that follows this URL cannot spend
 * the token, because the part that matters never leaves the recipient's browser.
 */
export const getLoginMail = (token: string): MailDocument => ({
  title: 'Log in to Nopestradamus',
  preheader: `The link works once and expires in ${LOGIN_TOKEN_TTL_SECONDS / 60} minutes.`,
  blocks: [
    { kind: 'heading', text: 'Log in to Nopestradamus' },
    {
      kind: 'paragraph',
      text: 'Somebody asked to log in to Nopestradamus as this address. Follow the link and you are in.',
    },
    { kind: 'button', label: 'Log in', url: `${SITE_URL}/#${token}` },
    {
      kind: 'note',
      text: `The link works once, and stops working after ${LOGIN_TOKEN_TTL_SECONDS / 60} minutes.`,
    },
    {
      kind: 'note',
      text: 'If that was not you, nothing has happened and nothing needs doing — the link expires on its own, and whoever typed your address in cannot see whether it exists.',
    },
  ],
})

export const getCreaterAcceptMail = (prediction: Prediction): MailDocument => ({
  title: 'Nopestradamus: your prediction is waiting for you to accept it',
  preheader: 'Your prediction does not start until you accept it.',
  blocks: [
    { kind: 'heading', text: 'One step left' },
    { kind: 'paragraph', text: 'This is the prediction that was created by this mail address.' },
    { kind: 'quote', title: prediction.title, body: prediction.body },
    ...predictionFacts(prediction),
    ...participantBlocks(prediction),
    {
      kind: 'paragraph',
      text: 'The link below only opens the prediction on the site. Accept or reject it with the buttons on the page.',
    },
    {
      kind: 'button',
      label: 'Open the prediction',
      url: predictionUrl(prediction.hash, prediction.creater.hash),
    },
    {
      kind: 'note',
      text: 'Nothing is sent to anybody else until you have accepted the prediction.',
    },
  ],
})

export const getParticipantAcceptMail = (
  prediction: Prediction,
  participant: Participant,
): MailDocument => ({
  title: `Your opinion has been requested by ${prediction.creater.mail}!`,
  preheader: `${prediction.creater.mail} wants to know whether you agree.`,
  blocks: [
    { kind: 'heading', text: 'You have been asked to take a side' },
    {
      kind: 'paragraph',
      text: `${prediction.creater.mail} has asked you to accept or reject a prediction.`,
    },
    { kind: 'quote', title: prediction.title, body: prediction.body },
    ...predictionFacts(prediction),
    ...participantBlocks(prediction),
    {
      kind: 'paragraph',
      text: `On ${formatDateString(prediction.finish_date)} you will all receive a mail and be confronted with your predictions.`,
    },
    {
      kind: 'paragraph',
      text: 'The link below only opens the prediction on the site. Accept or reject it with the buttons on the page.',
    },
    {
      kind: 'button',
      label: 'Open the prediction',
      url: predictionUrl(prediction.hash, participant.hash),
    },
  ],
})

export const getCreaterEndMail = (prediction: Prediction): MailDocument => ({
  title: `Your prediction has finished: ${prediction.title}`,
  preheader: `Created ${formatDateString(prediction.created)}. Time is up.`,
  blocks: [
    { kind: 'heading', text: 'Your prediction has finished' },
    {
      kind: 'paragraph',
      text: `A prediction was created by you on ${formatDateString(prediction.created)}. It has now finished.`,
    },
    { kind: 'quote', title: prediction.title, body: prediction.body },
    ...predictionFacts(prediction),
    ...participantBlocks(prediction),
    {
      kind: 'button',
      label: 'See the prediction',
      url: predictionUrl(prediction.hash, prediction.creater.hash),
    },
    { kind: 'note', text: 'Hope you had fun!' },
  ],
})

export const getParticipantEndMail = (
  prediction: Prediction,
  participant: Participant,
): MailDocument => ({
  title: `The prediction from ${prediction.creater.mail} has finished!`,
  preheader: 'Time is up. Now you have to work out who was right.',
  blocks: [
    { kind: 'heading', text: 'The prediction has finished' },
    {
      kind: 'paragraph',
      text: `A prediction from ${prediction.creater.mail} was accepted by you on ${formatDateString(participant.accepted_date)}. It has now finished.`,
    },
    { kind: 'quote', title: prediction.title, body: prediction.body },
    ...predictionFacts(prediction),
    ...participantBlocks(prediction),
    {
      kind: 'button',
      label: 'See the prediction',
      url: predictionUrl(prediction.hash, participant.hash),
    },
    { kind: 'note', text: 'Now you must discuss who was right!' },
  ],
})

/**
 * A comment, sent to everybody who has accepted the prediction except whoever wrote it. The
 * button carries the recipient's own role hash, like every other prediction mail, so it logs them
 * in and a reply is one click away.
 *
 * Every address shows in full: everybody who gets this is part of the prediction, and the
 * prediction page shows them each other's addresses too.
 */
export const getCommentMail = (
  prediction: Prediction,
  authorMail: string,
  body: string,
  recipientRoleHash: string,
): MailDocument => ({
  title: `New comment on: ${prediction.title}`,
  preheader: `${authorMail} commented on a prediction you accepted.`,
  blocks: [
    { kind: 'heading', text: 'New comment' },
    {
      kind: 'paragraph',
      text: `${authorMail} commented on the prediction "${prediction.title}".`,
    },
    { kind: 'quote', body },
    {
      kind: 'button',
      label: 'Read and reply',
      url: predictionUrl(prediction.hash, recipientRoleHash),
    },
    {
      kind: 'note',
      text: ACTIVITY_NOTE,
    },
  ],
})

/**
 * A participant has accepted or rejected, sent to everybody else who has accepted — the same
 * people a comment goes to. The prediction is not quoted: everybody who gets this has already
 * read and accepted it, and the title is enough to say which one.
 */
export const getAnswerMail = (
  prediction: Prediction,
  answererMail: string,
  accepted: boolean,
  recipientRoleHash: string,
): MailDocument => {
  const answer = accepted ? 'accepted' : 'rejected'
  return {
    title: `${answererMail} ${answer}: ${prediction.title}`,
    preheader: `${answererMail} ${answer} a prediction you accepted.`,
    blocks: [
      { kind: 'heading', text: accepted ? 'New participant' : 'A participant said no' },
      {
        kind: 'paragraph',
        text: `${answererMail} has ${answer} the prediction "${prediction.title}".`,
      },
      ...predictionFacts(prediction),
      {
        kind: 'button',
        label: 'See the prediction',
        url: predictionUrl(prediction.hash, recipientRoleHash),
      },
      { kind: 'note', text: ACTIVITY_NOTE },
    ],
  }
}

const ACTIVITY_NOTE =
  'You get these because you accepted this prediction. Muting its activity stops mails about comments and answers, and only those: the mail when the prediction finishes still comes.'

/**
 * The monthly proof of life. Deliberately reports numbers rather than just "it works": generating
 * them exercises the database, and a figure that looks wrong says more than a cheerful constant.
 */
export const getHealthMail = (
  health: PredictionHealth,
  predictionsWithUnsentMail: number,
): MailDocument => ({
  title: 'Nopestradamus is working',
  preheader: `${health.running} running, ${predictionsWithUnsentMail} mails unsent.`,
  blocks: [
    { kind: 'heading', text: 'Nopestradamus is working' },
    {
      kind: 'paragraph',
      text: 'The cron process is alive and sent this on the first of the month. If it ever stops arriving, something is broken: the cron process, postfix, or the mail setup described in the README.',
    },
    {
      kind: 'facts',
      rows: [
        { label: 'Predictions', value: String(health.total) },
        { label: 'Awaiting creater', value: String(health.awaiting_creater) },
        { label: 'Running', value: String(health.running) },
        { label: 'Finished', value: String(health.finished) },
        {
          label: 'Next to finish',
          value:
            health.next_finish_date !== undefined
              ? formatDateString(health.next_finish_date)
              : 'none',
        },
        { label: 'Mail still unsent', value: String(predictionsWithUnsentMail) },
      ],
    },
    {
      kind: 'note',
      text: 'That last number is normally 0. The hourly job sends whatever it finds, so anything stuck there means sending is failing.',
    },
    { kind: 'button', label: 'Open the admin console', url: `${SITE_URL}/admin` },
  ],
})

/**
 * The line every mail ends with. Added when a mail is sent rather than written into each one,
 * because it needs the account hash, which is a property of the recipient and not of the mail.
 *
 * An activity mail (a comment, an answer) passes `muteActivityOf` and offers muting that
 * prediction's activity mails first, so getting out of one chatty prediction does not cost
 * somebody every mail the site will ever send them — the mail when the prediction finishes
 * included.
 */
export const withUnsubscribeFooter = (
  mail: MailDocument,
  accountHash: string,
  muteActivityOf?: string,
): MailDocument => ({
  ...mail,
  blocks: [
    ...mail.blocks,
    { kind: 'divider' },
    { kind: 'note', text: "Don't want to receive these mails?" },
    ...(muteActivityOf === undefined
      ? []
      : [
          {
            kind: 'link' as const,
            label: 'Mute activity on this prediction',
            url: muteActivityPageUrl(accountHash, muteActivityOf),
          },
        ]),
    {
      kind: 'link',
      label: 'Stop every mail from Nopestradamus',
      url: `${SITE_URL}/blockme/${accountHash}`,
    },
  ],
})

// the path predates answer mails and stays, because comment mails already sent carry it
const muteActivityPageUrl = (accountHash: string, predictionHash: string): string =>
  `${SITE_URL}/mute-comments/${accountHash}/${predictionHash}`

const predictionFacts = (prediction: Prediction): Block[] => [
  {
    kind: 'facts',
    rows: [
      { label: 'Created by', value: prediction.creater.mail },
      { label: 'Created', value: formatDateString(prediction.created) },
      { label: 'Finishes', value: formatDateString(prediction.finish_date) },
      { label: 'Participants', value: String(prediction.participants.length) },
    ],
  },
]

// A prediction with nobody else on it is allowed, and a table headed "participants" with no rows
// under it looks like a bug rather than an empty list.
const participantBlocks = (prediction: Prediction): Block[] =>
  prediction.participants.length === 0
    ? []
    : [
        {
          kind: 'people',
          label: 'Everybody on this prediction',
          mails: prediction.participants.map((participant) => participant.mail),
        },
      ]
