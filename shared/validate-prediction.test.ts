import { describe, expect, it } from 'vitest'

import {
  MAX_PARTICIPANTS,
  validateCreaterMail,
  validateDateString,
  validateDescription,
  validateFinishDate,
  validateParticipant,
  validateParticipantCount,
  validateTitle,
} from './validate-prediction.ts'

describe('validateTitle / validateDescription', () => {
  it('requires non-blank text', () => {
    expect(validateTitle('Bitcoin hits zero')).toBe(true)
    expect(validateTitle('')).toBe(false)
    expect(validateTitle('   ')).toBe(false)
    expect(validateTitle(undefined)).toBe(false)

    expect(validateDescription('because reasons')).toBe(true)
    expect(validateDescription('  ')).toBe(false)
    expect(validateDescription(undefined)).toBe(false)
  })
})

describe('validateDateString', () => {
  it('accepts the yyyy-MM-dd value a date input produces', () => {
    expect(validateDateString('2031-12-01')).toBe(true)
  })

  it('accepts an ISO timestamp', () => {
    expect(validateDateString('2031-12-01T00:00:00.000Z')).toBe(true)
  })

  it('rejects junk and missing values', () => {
    expect(validateDateString('nonsense')).toBe(false)
    expect(validateDateString('')).toBe(false)
    expect(validateDateString(undefined)).toBe(false)
  })
})

describe('validateFinishDate', () => {
  it('accepts today and later', () => {
    expect(validateFinishDate('2026-09-19', '2026-09-19')).toBe(true)
    expect(validateFinishDate('2026-09-20', '2026-09-19')).toBe(true)
    expect(validateFinishDate('2031-12-01T00:00:00.000Z', '2026-09-19')).toBe(true)
  })

  it('rejects a date in the past', () => {
    expect(validateFinishDate('2026-09-18', '2026-09-19')).toBe(false)
    expect(validateFinishDate('2026-09-18T23:59:59.000Z', '2026-09-19')).toBe(false)
  })

  it('rejects junk, missing values and dates not written yyyy-MM-dd', () => {
    expect(validateFinishDate('nonsense', '2026-09-19')).toBe(false)
    expect(validateFinishDate(undefined, '2026-09-19')).toBe(false)
    expect(validateFinishDate('Dec 1 2031', '2026-09-19')).toBe(false)
  })
})

describe('validateCreaterMail', () => {
  it('requires a valid mail', () => {
    expect(validateCreaterMail('a@b.com')).toBe(true)
    expect(validateCreaterMail('nope')).toBe(false)
    expect(validateCreaterMail(undefined)).toBe(false)
  })
})

describe('validateParticipant', () => {
  it('accepts a valid, unique mail', () => {
    expect(validateParticipant('a@b.com', ['a@b.com', 'c@d.com'], 'x@y.com')).toBe(true)
  })

  it('rejects duplicates in the list', () => {
    expect(validateParticipant('a@b.com', ['a@b.com', 'a@b.com'], 'x@y.com')).toBe(false)
  })

  it('rejects duplicates that differ only by case', () => {
    expect(validateParticipant('a@b.com', ['a@b.com', 'A@b.com'], 'x@y.com')).toBe(false)
  })

  it('rejects invalid mails', () => {
    expect(validateParticipant('nope', ['nope'], 'x@y.com')).toBe(false)
  })

  it('rejects the creater, whatever the case', () => {
    expect(validateParticipant('a@b.com', ['a@b.com'], 'a@b.com')).toBe(false)
    expect(validateParticipant(' A@b.com', [' A@b.com'], 'a@B.com ')).toBe(false)
  })
})

describe('validateParticipantCount', () => {
  const mails = (count: number) => Array.from({ length: count }, (_v, i) => `p${i}@b.com`)

  it('accepts up to MAX_PARTICIPANTS', () => {
    expect(MAX_PARTICIPANTS).toBe(10)
    expect(validateParticipantCount([])).toBe(true)
    expect(validateParticipantCount(mails(10))).toBe(true)
  })

  it('rejects more than MAX_PARTICIPANTS', () => {
    expect(validateParticipantCount(mails(11))).toBe(false)
  })
})
