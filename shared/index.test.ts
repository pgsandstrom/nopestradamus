import { describe, expect, it } from 'vitest'

import { getPredictionStatus, isRole } from './index.ts'

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

describe('isRole', () => {
  it('accepts the two roles and nothing else', () => {
    expect(isRole('creater')).toBe(true)
    expect(isRole('participant')).toBe(true)
    expect(isRole('nonsense')).toBe(false)
  })
})
