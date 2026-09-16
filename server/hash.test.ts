import { describe, expect, it } from 'vitest'

import { randomHash } from './hash.ts'

describe('randomHash', () => {
  it('is 15 lower case characters from the unambiguous alphabet', () => {
    for (let i = 0; i < 100; i++) {
      expect(randomHash()).toMatch(/^[0-9a-hjkmnp-tv-z]{15}$/)
    }
  })

  it('does not repeat itself', () => {
    const hashes = new Set(Array.from({ length: 1000 }, randomHash))
    expect(hashes.size).toBe(1000)
  })
})
