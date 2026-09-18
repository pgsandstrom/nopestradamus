import { describe, expect, it } from 'vitest'

import type { Prediction } from '../../shared/index.ts'
import { renderMail } from './render.ts'
import {
  getCreaterAcceptMail,
  getLoginMail,
  getParticipantAcceptMail,
  withUnsubscribeFooter,
} from './templates.ts'

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
    const { text, html } = renderMail(getCreaterAcceptMail(prediction()))
    const url = 'https://nopestradamus.com/prediction/predictionhash1#createrhash1234'
    expect(text).toContain(url)
    expect(html).toContain(url)
  })

  it('links a participant with their own hash, not the creater one', () => {
    const { text, html } = renderMail(
      getParticipantAcceptMail(prediction(), prediction().participants[0]!),
    )
    expect(text).toContain('https://nopestradamus.com/prediction/predictionhash1#participanthash')
    expect(text).not.toContain('createrhash1234')
    expect(html).not.toContain('createrhash1234')
  })

  it('leaves the participant list out when there is nobody else', () => {
    const solo = { ...prediction(), participants: [] }
    expect(renderMail(getCreaterAcceptMail(solo)).text).not.toContain(
      'Everybody on this prediction',
    )
  })
})

describe('getLoginMail', () => {
  it('carries the token in the fragment and says it is short lived', () => {
    const { text } = renderMail(getLoginMail('logintoken12345'))
    expect(text).toContain('https://nopestradamus.com/#logintoken12345')
    expect(text).toContain('works once')
    expect(text).toContain('30 minutes')
  })
})

describe('withUnsubscribeFooter', () => {
  it('puts the block link in both halves, so a plain-text reader can also get out', () => {
    const { text, html } = renderMail(
      withUnsubscribeFooter(getLoginMail('logintoken12345'), 'accounthash1234'),
    )
    expect(text).toContain('https://nopestradamus.com/blockme/accounthash1234')
    expect(html).toContain('https://nopestradamus.com/blockme/accounthash1234')
  })
})
