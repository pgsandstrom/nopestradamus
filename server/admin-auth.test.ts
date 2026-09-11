import { describe, expect, it } from 'vitest'

import { createLoginThrottle, createSessionToken, isSessionTokenValid } from './admin-auth.ts'

const SECRET = 'correct horse battery staple'
const NOW = Date.UTC(2026, 0, 1)
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

describe('session tokens', () => {
  it('accepts a token it just signed', () => {
    expect(isSessionTokenValid(createSessionToken(SECRET, NOW), SECRET, NOW + 1000)).toBe(true)
  })

  it('gives every session its own token', () => {
    expect(createSessionToken(SECRET, NOW)).not.toBe(createSessionToken(SECRET, NOW))
  })

  it('rejects a token signed with another secret', () => {
    const token = createSessionToken('other password', NOW)
    expect(isSessionTokenValid(token, SECRET, NOW + 1000)).toBe(false)
  })

  it('rejects a token whose expiry was edited', () => {
    const token = createSessionToken(SECRET, NOW)
    const [, nonce, signature] = token.split('.')
    const forged = `${NOW + 10 * WEEK_MS}.${nonce}.${signature}`
    expect(isSessionTokenValid(forged, SECRET, NOW + 1000)).toBe(false)
  })

  it('rejects a token past its expiry', () => {
    const token = createSessionToken(SECRET, NOW)
    expect(isSessionTokenValid(token, SECRET, NOW + WEEK_MS + 1)).toBe(false)
  })

  it('rejects garbage', () => {
    for (const token of ['', '.', 'nope', `${NOW + WEEK_MS}.nonce.`]) {
      expect(isSessionTokenValid(token, SECRET, NOW)).toBe(false)
    }
  })
})

describe('login throttle', () => {
  it('lets the first attempts through', () => {
    const throttle = createLoginThrottle()
    for (let i = 0; i < 3; i++) {
      expect(throttle.retryInSeconds(NOW)).toBe(0)
      throttle.recordFailure(NOW)
    }
    expect(throttle.retryInSeconds(NOW)).toBe(0)
  })

  it('locks out after too many failures, for longer every time', () => {
    const throttle = createLoginThrottle()
    for (let i = 0; i < 4; i++) {
      throttle.recordFailure(NOW)
    }
    expect(throttle.retryInSeconds(NOW)).toBe(5)

    throttle.recordFailure(NOW)
    expect(throttle.retryInSeconds(NOW)).toBe(10)
  })

  it('caps the lockout', () => {
    const throttle = createLoginThrottle()
    for (let i = 0; i < 50; i++) {
      throttle.recordFailure(NOW)
    }
    expect(throttle.retryInSeconds(NOW)).toBe(5 * 60)
  })

  it('lets attempts through again once the lockout has passed', () => {
    const throttle = createLoginThrottle()
    for (let i = 0; i < 4; i++) {
      throttle.recordFailure(NOW)
    }
    expect(throttle.retryInSeconds(NOW + 5000)).toBe(0)
  })

  it('forgets the failures on reset', () => {
    const throttle = createLoginThrottle()
    for (let i = 0; i < 10; i++) {
      throttle.recordFailure(NOW)
    }
    throttle.reset()
    expect(throttle.retryInSeconds(NOW)).toBe(0)
  })
})
