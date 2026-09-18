import { describe, expect, it } from 'vitest'

import { renderText } from './render-text.ts'

describe('renderText', () => {
  it('lines the values of a table up under each other', () => {
    const text = renderText({
      title: 'health',
      blocks: [
        {
          kind: 'facts',
          rows: [
            { label: 'Predictions', value: '128' },
            { label: 'Running', value: '97' },
          ],
        },
      ],
    })

    expect(text).toContain('Predictions: 128')
    expect(text).toContain('Running:     97')
  })

  it('wraps a paragraph, because a mail client will not do it for us', () => {
    const text = renderText({
      title: 'long',
      blocks: [{ kind: 'paragraph', text: 'word '.repeat(60).trim() }],
    })

    for (const line of text.split('\n')) {
      expect(line.length).toBeLessThanOrEqual(78)
    }
  })

  it('leaves a URL longer than the width in one piece', () => {
    const url = `https://nopestradamus.com/prediction/${'x'.repeat(90)}`
    const text = renderText({
      title: 'long',
      blocks: [{ kind: 'paragraph', text: `Follow ${url} to answer` }],
    })

    expect(text).toContain(url)
  })

  it('writes a button out as a label and a URL on its own line to copy', () => {
    const text = renderText({
      title: 'login',
      blocks: [{ kind: 'button', label: 'Log in', url: 'https://example.com/#token' }],
    })

    expect(text).toContain('Log in:\nhttps://example.com/#token')
  })
})
