import { describe, expect, it } from 'vitest'

import { parseConfig } from './config.ts'

describe('parseConfig', () => {
  it('reads a config with only the required key', () => {
    expect(parseConfig('{"adminPassword": "abc"}')).toEqual({
      adminPassword: 'abc',
      healthMailReceiver: undefined,
    })
  })

  it('reads the optional health mail receiver', () => {
    const config = parseConfig('{"adminPassword": "abc", "healthMailReceiver": "you@example.com"}')
    expect(config.healthMailReceiver).toBe('you@example.com')
  })

  it('names the file and the parse error when the JSON is broken', () => {
    // a trailing comma, which is what hand-editing the file tends to leave behind
    expect(() => parseConfig('{"adminPassword": "abc",}', './config.json')).toThrow(
      /^\.\/config\.json is not valid JSON: /,
    )
  })

  it('rejects JSON that is not an object', () => {
    for (const contents of ['null', '"abc"', '[]']) {
      expect(() => parseConfig(contents)).toThrow(/must hold a JSON object/)
    }
  })

  it('rejects a missing, blank or mistyped admin password', () => {
    for (const contents of ['{}', '{"adminPassword": ""}', '{"adminPassword": 123}']) {
      expect(() => parseConfig(contents)).toThrow(/"adminPassword" to be a non-empty string/)
    }
  })

  it('rejects a mistyped health mail receiver', () => {
    expect(() => parseConfig('{"adminPassword": "abc", "healthMailReceiver": 1}')).toThrow(
      /"healthMailReceiver" to be a string/,
    )
  })
})
