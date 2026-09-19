import { describe, expect, it } from 'vitest'

import {
  type CreatePredictionInput,
  DESCRIPTION_MAX_LENGTH,
  listPredictionErrors,
  MAX_PARTICIPANTS,
  TITLE_MAX_LENGTH,
  validateDateString,
  validateFinishDate,
  validatePrediction,
} from './validate-prediction.ts'

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

describe('validatePrediction', () => {
  const today = '2026-09-19'
  const valid: CreatePredictionInput = {
    title: 'Bitcoin hits zero',
    body: 'because reasons',
    finishDate: '2031-12-01',
    isPublic: true,
    createrMail: 'x@y.com',
    participantList: ['a@b.com', 'c@d.com'],
  }
  const validate = (change: Partial<CreatePredictionInput>) =>
    validatePrediction({ ...valid, ...change }, today)
  const mails = (count: number) => Array.from({ length: count }, (_v, i) => `p${i}@b.com`)

  it('finds nothing wrong with a valid prediction', () => {
    expect(validatePrediction(valid, today)).toEqual({})
  })

  it('requires a non-blank title and description', () => {
    expect(validate({ title: '   ' }).title).toBe('The prediction needs a title')
    expect(validate({ title: undefined }).title).toBe('The prediction needs a title')
    expect(validate({ body: '' }).body).toBe('The prediction needs a description')
  })

  it('limits the length of title and description, measured after trimming', () => {
    expect(validate({ title: 'x'.repeat(TITLE_MAX_LENGTH) }).title).toBeUndefined()
    expect(validate({ title: ` ${'x'.repeat(TITLE_MAX_LENGTH)} ` }).title).toBeUndefined()
    expect(validate({ title: 'x'.repeat(TITLE_MAX_LENGTH + 1) }).title).toBe(
      `The title can be at most ${TITLE_MAX_LENGTH} characters long (it is ${TITLE_MAX_LENGTH + 1})`,
    )
    expect(validate({ body: 'x'.repeat(DESCRIPTION_MAX_LENGTH) }).body).toBeUndefined()
    expect(validate({ body: 'x'.repeat(DESCRIPTION_MAX_LENGTH + 1) }).body).toMatch(/at most/)
  })

  it('tells a past end date from a broken one', () => {
    expect(validate({ finishDate: '2026-09-18' }).finishDate).toBe(
      'The end date cannot be in the past',
    )
    expect(validate({ finishDate: 'nonsense' }).finishDate).toBe('Invalid date')
  })

  it('requires a valid creater mail and a visibility', () => {
    expect(validate({ createrMail: 'nope' }).createrMail).toBe('Invalid mail')
    expect(validate({ isPublic: undefined }).isPublic).toBe('Invalid visibility')
  })

  it('puts each participant error at that participant', () => {
    expect(validate({ participantList: ['a@b.com', 'nope'] }).participants).toEqual([
      undefined,
      'Invalid participant e-mail',
    ])
  })

  it('rejects the creater as a participant, whatever the case', () => {
    expect(validate({ participantList: [' X@y.com'] }).participants).toEqual([
      'You are already part of the prediction as its creater',
    ])
  })

  it('rejects duplicate participants, whatever the case', () => {
    expect(validate({ participantList: ['a@b.com', 'A@b.com'] }).participants).toEqual([
      'This participant is already on the list',
      'This participant is already on the list',
    ])
  })

  it('calls an invalid mail invalid even when it is also a duplicate', () => {
    expect(validate({ participantList: ['nope', 'nope'] }).participants).toEqual([
      'Invalid participant e-mail',
      'Invalid participant e-mail',
    ])
  })

  it('accepts up to MAX_PARTICIPANTS', () => {
    expect(MAX_PARTICIPANTS).toBe(10)
    expect(validate({ participantList: [] })).toEqual({})
    expect(validate({ participantList: mails(MAX_PARTICIPANTS) })).toEqual({})
    expect(validate({ participantList: mails(MAX_PARTICIPANTS + 1) }).participantList).toBe(
      `A prediction can have at most ${MAX_PARTICIPANTS} participants`,
    )
  })

  it('survives input that did not come from the form', () => {
    const junk = { title: 42, participantList: 'a@b.com' } as unknown as CreatePredictionInput
    const errors = validatePrediction(junk, today)
    expect(errors.title).toBe('The prediction needs a title')
    expect(errors.participantList).toBe('Invalid participant list')
  })
})

describe('listPredictionErrors', () => {
  it('lists the field messages in form order, participants last', () => {
    expect(
      listPredictionErrors({
        participants: [undefined, 'Invalid participant e-mail'],
        createrMail: 'Invalid mail',
        title: 'The prediction needs a title',
      }),
    ).toEqual(['The prediction needs a title', 'Invalid mail', 'Invalid participant e-mail'])
  })
})
