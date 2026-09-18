import type { Participant, Prediction } from '../../shared/index.ts'
import type { MailDocument } from './blocks.ts'
import {
  getCreaterAcceptMail,
  getCreaterEndMail,
  getHealthMail,
  getLoginMail,
  getParticipantAcceptMail,
  getParticipantEndMail,
  withUnsubscribeFooter,
} from './templates.ts'

/**
 * Every mail the service sends, against made-up data, for `/dev/mails` to render.
 *
 * Fixtures rather than real rows on purpose. The cases that break a mail layout are the awkward
 * ones — nobody else on the prediction, eight people on it, a title too long for one line, a body
 * with angle brackets in it — and waiting for the database to happen to contain one of those is
 * no way to design a mail. Every sample carries the unsubscribe footer, because that is what
 * lands in the inbox.
 */
export interface MailSample {
  /** Stable enough to link to and to put in a bug report. */
  id: string
  name: string
  /** Why this sample is in the list — usually the edge case it covers. */
  description: string
  mail: MailDocument
}

const participant = (mail: string, overrides: Partial<Participant> = {}): Participant => ({
  mail,
  hash: `hash${mail.length}${mail.charCodeAt(0)}`,
  accepted: true,
  accepted_date: '2026-02-03T09:12:00.000Z',
  accepted_mail_sent: true,
  end_mail_sent: false,
  ...overrides,
})

const prediction = (overrides: Partial<Prediction> = {}): Prediction => ({
  created: '2026-02-01T08:30:00.000Z',
  title: 'Nobody will have shipped a self-driving taxi to this city',
  body: `I say the streets look the same in ten years. Same buses, same roadworks, same drivers swearing at the same junction.

Whoever is wrong buys dinner.`,
  hash: 'p7k2m9x4t1b6c3v',
  finish_date: '2036-02-01',
  creater: {
    mail: 'hopeful@example.com',
    hash: 'c4n8j2q7w1z5y3r',
    accepted: true,
    accepted_date: '2026-02-01T08:35:00.000Z',
    accepted_mail_sent: true,
    end_mail_sent: false,
  },
  participants: [participant('skeptic@example.com'), participant('the.referee@example.com')],
  ...overrides,
})

const soloPrediction = prediction({ participants: [] })

const crowdedPrediction = prediction({
  participants: [
    'a.very.long.address.that.will.not.fit@some-department.example.org',
    'b@example.com',
    'c@example.com',
    'd@example.com',
    'e@example.com',
    'f@example.com',
    'g@example.com',
    'h@example.com',
  ].map((mail) => participant(mail)),
})

const awkwardPrediction = prediction({
  title: 'A title long enough to wrap onto a second line in a 600 pixel column, and then some more',
  body: `Angle brackets <b>should not become bold</b> and an ampersand & should survive.

A line
break
inside the body should survive too.`,
})

export const MAIL_SAMPLES: MailSample[] = [
  {
    id: 'login',
    name: 'Login link',
    description: 'The only mail with no prediction in it. One button, two lines of small print.',
    mail: getLoginMail('t9r4k2m7x1c5b3v'),
  },
  {
    id: 'creater-accept',
    name: 'Creater accept',
    description: 'Sent the moment a prediction is created. Nothing happens until it is answered.',
    mail: getCreaterAcceptMail(prediction()),
  },
  {
    id: 'creater-accept-solo',
    name: 'Creater accept, nobody else',
    description: 'A prediction with no participants. The people list has to disappear, not empty.',
    mail: getCreaterAcceptMail(soloPrediction),
  },
  {
    id: 'participant-accept',
    name: 'Participant accept',
    description: 'The invitation. Carries the participant hash, never the creater one.',
    mail: getParticipantAcceptMail(prediction(), prediction().participants[0]!),
  },
  {
    id: 'participant-accept-crowded',
    name: 'Participant accept, eight people',
    description: 'A long people list, including an address too wide for the column.',
    mail: getParticipantAcceptMail(crowdedPrediction, crowdedPrediction.participants[0]!),
  },
  {
    id: 'creater-end',
    name: 'Creater end',
    description: 'Ten years later. Same shape as the accept mail, different words.',
    mail: getCreaterEndMail(prediction()),
  },
  {
    id: 'participant-end',
    name: 'Participant end',
    description: 'The other half of the finish, addressed to somebody who accepted.',
    mail: getParticipantEndMail(prediction(), prediction().participants[0]!),
  },
  {
    id: 'awkward',
    name: 'Awkward input',
    description:
      'Long title, markup in the body, hard line breaks. Proves the escaping and the wrapping.',
    mail: getCreaterAcceptMail(awkwardPrediction),
  },
  {
    id: 'health',
    name: 'Monthly health',
    description: 'The proof of life. The only mail that is mostly table.',
    mail: getHealthMail(
      {
        total: 128,
        awaiting_creater: 3,
        running: 97,
        finished: 28,
        next_finish_date: '2026-11-04',
      },
      0,
    ),
  },
  {
    id: 'health-empty',
    name: 'Monthly health, empty database',
    description: 'Every counter zero and no next date — the shape after a fresh deploy.',
    mail: getHealthMail({ total: 0, awaiting_creater: 0, running: 0, finished: 0 }, 0),
  },
].map((sample) => ({
  ...sample,
  mail: withUnsubscribeFooter(sample.mail, 'a1c3e5g7j9l2n4q'),
}))
