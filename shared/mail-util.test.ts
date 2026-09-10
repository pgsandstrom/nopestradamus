import { describe, expect, it } from 'vitest'

import { censorMail, isMailValid } from './mail-util.ts'

describe('isMailValid', () => {
  it.each(['a@b.com', 'first.last@example.co.uk', 'x+tag@mail.example.com', 'a@[127.0.0.1]'])(
    'accepts %s',
    (mail) => {
      expect(isMailValid(mail)).toBe(true)
    },
  )

  it.each([
    '',
    'nope',
    'no@domain',
    'no-at-sign.com',
    'two@@at.com',
    'trailing@dot.',
    String.raw`back\slash@b.com`, // the local part may not contain a backslash
  ])('rejects %s', (mail) => {
    expect(isMailValid(mail)).toBe(false)
  })

  it('ignores surrounding whitespace', () => {
    expect(isMailValid('  a@b.com  ')).toBe(true)
  })
})

describe('censorMail', () => {
  it('censors part of the local part', () => {
    const censored = censorMail('someone@example.com')
    expect(censored).not.toBe('someone@example.com')
    expect(censored).toContain('*')
    expect(censored.endsWith('@example.com')).toBe(true)
    expect(censored).toHaveLength('someone@example.com'.length)
  })

  it('censors the domain when the local part is too short to hide', () => {
    expect(censorMail('ab@example.com')).toBe('ab@exa****.com')
  })

  it('leaves invalid mails untouched', () => {
    expect(censorMail('not-a-mail')).toBe('not-a-mail')
  })

  it('never leaks the full local part', () => {
    expect(censorMail('predictor@nopestradamus.com')).not.toContain('predictor')
  })
})
