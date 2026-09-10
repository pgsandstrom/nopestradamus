import { describe, expect, it } from 'vitest'

import { formatDate, formatDateString, formatDateTime, isValidDate } from './date-util.ts'

describe('formatDate', () => {
  it('formats as yyyy-MM-dd', () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe('2024-01-05')
  })

  it('reports missing and invalid dates', () => {
    expect(formatDate(undefined)).toBe('[MISSING DATE]')
    expect(formatDate(new Date('nonsense'))).toBe('[MISSING DATE]')
  })
})

describe('formatDateTime', () => {
  it('formats as yyyy-MM-dd HH:mm in 24 hour time', () => {
    expect(formatDateTime(new Date(2024, 0, 5, 14, 30))).toBe('2024-01-05 14:30')
  })

  it('reports missing dates', () => {
    expect(formatDateTime(undefined)).toBe('[MISSING DATE]')
  })
})

describe('formatDateString', () => {
  it('parses an ISO string', () => {
    expect(formatDateString('2031-12-01T12:00:00.000Z')).toBe('2031-12-01')
  })

  it('reports unparseable strings', () => {
    expect(formatDateString('nonsense')).toBe('[MISSING DATE]')
    expect(formatDateString(undefined)).toBe('[MISSING DATE]')
  })
})

describe('isValidDate', () => {
  it('narrows valid dates', () => {
    expect(isValidDate(new Date())).toBe(true)
    expect(isValidDate(null)).toBe(false)
    expect(isValidDate(undefined)).toBe(false)
    expect(isValidDate(new Date('nonsense'))).toBe(false)
  })
})
