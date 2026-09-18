import { describe, expect, it } from 'vitest'

import { LOGIN_COVER_ATTRIBUTE, loginCoverScript } from './login-cover-script.ts'

/**
 * The script is a string, so the compiler never looks at it and the browser is the first thing
 * that does. Running it here against a stand-in for the two globals it touches is the only check
 * that it parses, that the regex survived being interpolated into a string, and that it agrees
 * with {@link LOGIN_COVER_ATTRIBUTE} — the name the stylesheet and the negotiator also spell out.
 */
const run = (hash: string) => {
  const attributes = new Map<string, string>()
  const timeouts: (() => void)[] = []
  const documentStub = {
    documentElement: {
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      removeAttribute: (name: string) => attributes.delete(name),
    },
  }
  // the Function constructor is the point: this is a test of a string that the browser evals
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const script = new Function('document', 'location', 'setTimeout', loginCoverScript) as (
    documentGlobal: typeof documentStub,
    locationGlobal: { hash: string },
    setTimeoutGlobal: (fn: () => void, ms: number) => void,
  ) => void
  script(documentStub, { hash }, (fn) => timeouts.push(fn))
  return { covered: () => attributes.has(LOGIN_COVER_ATTRIBUTE), giveUp: () => timeouts[0]?.() }
}

describe('loginCoverScript', () => {
  it('covers the page for a fragment that looks like a role hash', () => {
    expect(run('#0123456789abcdf').covered()).toBe(true)
    expect(run('#f81d4fae-7dec-11d0-a765-00a0c91e6bf6').covered()).toBe(true)
  })

  it('leaves the page alone for anything else', () => {
    expect(run('').covered()).toBe(false)
    expect(run('#participants').covered()).toBe(false)
    expect(run('#0123456789abcd').covered()).toBe(false)
  })

  it('uncovers itself if nothing ever answers', () => {
    const cover = run('#0123456789abcdf')
    expect(cover.covered()).toBe(true)
    cover.giveUp()
    expect(cover.covered()).toBe(false)
  })
})
