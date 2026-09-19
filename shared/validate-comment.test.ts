import { describe, expect, it } from 'vitest'

import { COMMENT_MAX_LENGTH, validateComment } from './validate-comment.ts'

describe('validateComment', () => {
  it('requires non-blank text', () => {
    expect(validateComment('I told you so')).toBe(true)
    expect(validateComment('')).toBe(false)
    expect(validateComment('  \n ')).toBe(false)
    expect(validateComment(undefined)).toBe(false)
  })

  it('caps the length, ignoring surrounding whitespace', () => {
    const longest = 'x'.repeat(COMMENT_MAX_LENGTH)
    expect(validateComment(longest)).toBe(true)
    expect(validateComment(`  ${longest}\n`)).toBe(true)
    expect(validateComment(`${longest}x`)).toBe(false)
  })
})
