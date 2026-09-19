import { describe, expect, it } from 'vitest'

import type { Participant, Prediction } from '../shared/index.ts'
import { getActivityMailRecipients } from './activity-mail.ts'

const person = (mail: string, accepted?: boolean): Participant => ({
  mail,
  hash: `hash-${mail}`,
  accepted,
  accepted_mail_sent: true,
  end_mail_sent: false,
})

const prediction = (
  creater: Participant,
  ...participants: Participant[]
): Pick<Prediction, 'creater' | 'participants'> => ({ creater, participants })

const mailsOf = (recipients: { mail: string }[]) => recipients.map((r) => r.mail)

describe('getActivityMailRecipients', () => {
  it('mails everybody who accepted, except whoever did it', () => {
    const recipients = getActivityMailRecipients(
      prediction(person('creater', true), person('a', true), person('b', true)),
      'a',
      new Set(),
    )
    expect(mailsOf(recipients)).toEqual(['creater', 'b'])
  })

  it('leaves out whoever has not answered and whoever rejected', () => {
    const recipients = getActivityMailRecipients(
      prediction(person('creater', true), person('unanswered'), person('rejected', false)),
      'creater',
      new Set(),
    )
    expect(recipients).toEqual([])
  })

  it('leaves out a creater who has not accepted yet', () => {
    const recipients = getActivityMailRecipients(
      prediction(person('creater'), person('a', true)),
      'a',
      new Set(),
    )
    expect(recipients).toEqual([])
  })

  it('leaves out whoever muted the activity', () => {
    const recipients = getActivityMailRecipients(
      prediction(person('creater', true), person('a', true), person('b', true)),
      'creater',
      new Set(['b']),
    )
    expect(mailsOf(recipients)).toEqual(['a'])
  })
})
