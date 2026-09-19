import { describe, expect, it } from 'vitest'

import type { Prediction } from './index.ts'
import {
  canWriteComments,
  getPredictionStatus,
  getRoleForMail,
  isAwaitingAnswerFrom,
  isLoginFragment,
  type PredictionListItem,
} from './index.ts'

const inTheFuture = new Date(Date.now() + 1000 * 60 * 60).toISOString()
const inThePast = new Date(Date.now() - 1000 * 60 * 60).toISOString()

describe('getPredictionStatus', () => {
  it('waits for the creater until they answer', () => {
    expect(getPredictionStatus(undefined, inTheFuture)).toBe('awaiting creater')
    expect(getPredictionStatus(undefined, inThePast)).toBe('awaiting creater')
  })

  it('reports a creater rejection whatever the date says', () => {
    expect(getPredictionStatus(false, inTheFuture)).toBe('rejected')
    expect(getPredictionStatus(false, inThePast)).toBe('rejected')
  })

  it('separates accepted predictions by their finish date', () => {
    expect(getPredictionStatus(true, inTheFuture)).toBe('running')
    expect(getPredictionStatus(true, inThePast)).toBe('finished')
  })
})

const predictionWith = (
  createrMail: string,
  participantMails: string[],
): Pick<Prediction, 'creater' | 'participants'> => ({
  creater: {
    mail: createrMail,
    hash: 'creater-hash',
    accepted_mail_sent: true,
    end_mail_sent: false,
  },
  participants: participantMails.map((mail, i) => ({
    mail,
    hash: `participant-hash-${i}`,
    accepted_mail_sent: true,
    end_mail_sent: false,
  })),
})

describe('getRoleForMail', () => {
  it('finds the creater and the participants', () => {
    const prediction = predictionWith('a@b.se', ['c@d.se', 'e@f.se'])
    expect(getRoleForMail(prediction, 'a@b.se')).toBe('creater')
    expect(getRoleForMail(prediction, 'c@d.se')).toBe('participant')
    expect(getRoleForMail(prediction, 'e@f.se')).toBe('participant')
  })

  it('makes a stranger nobody, not a participant', () => {
    expect(getRoleForMail(predictionWith('a@b.se', ['c@d.se']), 'x@y.se')).toBeUndefined()
  })

  it('prefers creater when the same address holds both roles', () => {
    expect(getRoleForMail(predictionWith('a@b.se', ['a@b.se']), 'a@b.se')).toBe('creater')
  })
})

describe('canWriteComments', () => {
  const prediction = predictionWith('a@b.se', ['c@d.se'])

  it('lets the creater and the participants in', () => {
    expect(canWriteComments(prediction, 'a@b.se')).toBe(true)
    expect(canWriteComments(prediction, 'c@d.se')).toBe(true)
  })

  it('keeps out a logged-in stranger and a visitor with no session', () => {
    expect(canWriteComments(prediction, 'x@y.se')).toBe(false)
    expect(canWriteComments(prediction, undefined)).toBe(false)
  })
})

describe('isLoginFragment', () => {
  it('accepts a hash of either generation', () => {
    expect(isLoginFragment('0123456789abcdf')).toBe(true)
    expect(isLoginFragment('zzzzzzzzzzzzzzz')).toBe(true)
    expect(isLoginFragment('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')).toBe(true)
  })

  it('leaves ordinary anchors alone', () => {
    expect(isLoginFragment('')).toBe(false)
    expect(isLoginFragment('participants')).toBe(false)
    expect(isLoginFragment('0123456789abcd')).toBe(false)
    expect(isLoginFragment('0123456789abcdef')).toBe(false)
    expect(isLoginFragment('0123456789ABCDF')).toBe(false)
    expect(isLoginFragment('f81d4fae7dec11d0a76500a0c91e6bf6')).toBe(false)
  })
})

const listItem = (over: Partial<PredictionListItem>): PredictionListItem => ({
  hash: 'h',
  title: 't',
  created: '2026-01-01',
  finish_date: '2030-01-01',
  role: 'participant',
  ...over,
})

describe('isAwaitingAnswerFrom', () => {
  it('is done with anyone who has answered, either way', () => {
    expect(isAwaitingAnswerFrom(listItem({ role: 'creater', own_answer: true }))).toBe(false)
    expect(isAwaitingAnswerFrom(listItem({ own_answer: false, creater_accepted: true }))).toBe(
      false,
    )
  })

  it('waits on a creater who has not answered', () => {
    expect(isAwaitingAnswerFrom(listItem({ role: 'creater' }))).toBe(true)
  })

  it('does not chase a participant before the creater has accepted', () => {
    // the participant has not been asked yet: their mail only goes out once the creater accepts
    expect(isAwaitingAnswerFrom(listItem({}))).toBe(false)
    expect(isAwaitingAnswerFrom(listItem({ creater_accepted: false }))).toBe(false)
    expect(isAwaitingAnswerFrom(listItem({ creater_accepted: true }))).toBe(true)
  })
})
