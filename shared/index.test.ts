import { describe, expect, it } from 'vitest'

import type { Prediction } from './index.ts'
import { getPredictionStatus, getRoleForMail, isRoleHashFragment } from './index.ts'

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

describe('isRoleHashFragment', () => {
  it('accepts a hash of either generation', () => {
    expect(isRoleHashFragment('0123456789abcdf')).toBe(true)
    expect(isRoleHashFragment('zzzzzzzzzzzzzzz')).toBe(true)
    expect(isRoleHashFragment('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')).toBe(true)
  })

  it('leaves ordinary anchors alone', () => {
    expect(isRoleHashFragment('')).toBe(false)
    expect(isRoleHashFragment('participants')).toBe(false)
    expect(isRoleHashFragment('0123456789abcd')).toBe(false)
    expect(isRoleHashFragment('0123456789abcdef')).toBe(false)
    expect(isRoleHashFragment('0123456789ABCDF')).toBe(false)
    expect(isRoleHashFragment('f81d4fae7dec11d0a76500a0c91e6bf6')).toBe(false)
  })
})
