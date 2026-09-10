import { describe, expect, it } from 'vitest'

import {
  validateCreaterMail,
  validateDate,
  validateDateString,
  validateDescription,
  validateParticipant,
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

describe('validateDate', () => {
  it('accepts real dates only', () => {
    expect(validateDate(new Date(2031, 11, 1))).toBe(true)
    expect(validateDate(new Date('nonsense'))).toBe(false)
    expect(validateDate(null)).toBe(false)
    expect(validateDate(undefined)).toBe(false)
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

describe('validateCreaterMail', () => {
  it('requires a valid mail', () => {
    expect(validateCreaterMail('a@b.com')).toBe(true)
    expect(validateCreaterMail('nope')).toBe(false)
    expect(validateCreaterMail(undefined)).toBe(false)
  })
})

describe('validateParticipant', () => {
  it('accepts a valid, unique mail', () => {
    expect(validateParticipant('a@b.com', ['a@b.com', 'c@d.com'])).toBe(true)
  })

  it('rejects duplicates in the list', () => {
    expect(validateParticipant('a@b.com', ['a@b.com', 'a@b.com'])).toBe(false)
  })

  it('rejects invalid mails', () => {
    expect(validateParticipant('nope', ['nope'])).toBe(false)
  })
})
