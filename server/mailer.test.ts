import { describe, expect, it } from 'vitest'

import type { Prediction } from '../shared/index.ts'
import { getCreaterAcceptMail, getLoginMail, getParticipantAcceptMail } from './mailer.ts'

/**
 * Every one of these links carries a secret in its fragment rather than its path, which is the
 * whole point of the scheme: a `?` or a `/` in place of that `#` sends the secret to the server
 * on every visit, and there is nothing in a mail body for a compiler to object to.
 */
const prediction = (): Prediction => ({
  created: '2026-01-01',
  title: 'a title',
  body: 'a body',
  hash: 'predictionhash1',
  finish_date: '2030-01-01',
  creater: {
    mail: 'creater@example.com',
    hash: 'createrhash1234',
    accepted_mail_sent: false,
    end_mail_sent: false,
  },
  participants: [
    {
      mail: 'participant@example.com',
      hash: 'participanthash',
      accepted_mail_sent: false,
      end_mail_sent: false,
    },
  ],
})

describe('prediction mails', () => {
  it('links the creater to the prediction with their hash in the fragment', () => {
    expect(getCreaterAcceptMail(prediction()).body).toContain(
      'https://nopestradamus.com/prediction/predictionhash1#createrhash1234',
    )
  })

  it('links a participant with their own hash, not the creater one', () => {
    const body = getParticipantAcceptMail(prediction(), prediction().participants[0]!).body
    expect(body).toContain('https://nopestradamus.com/prediction/predictionhash1#participanthash')
    expect(body).not.toContain('createrhash1234')
  })
})

describe('getLoginMail', () => {
  it('carries the token in the fragment and says it is short lived', () => {
    const body = getLoginMail('logintoken12345').body
    expect(body).toContain('https://nopestradamus.com/#logintoken12345')
    expect(body).toContain('works once')
    expect(body).toContain('30 minutes')
  })
})
