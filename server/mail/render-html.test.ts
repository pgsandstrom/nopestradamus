import { describe, expect, it } from 'vitest'

import type { Block, MailDocument } from './blocks.ts'
import { MAIL_SAMPLES } from './fixtures.ts'
import { renderMail } from './render.ts'
import { renderHtml } from './render-html.ts'

const document = (blocks: Block[]): MailDocument => ({ title: 'a subject', blocks })

describe('renderHtml', () => {
  it('escapes a prediction written by somebody with ideas', () => {
    const html = renderHtml(
      document([
        { kind: 'quote', title: '<script>alert(1)</script>', body: 'Tom & Jerry say "no"' },
      ]),
    )
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('Tom &amp; Jerry')
    expect(html).toContain('&quot;no&quot;')
  })

  it('keeps the line breaks somebody typed into a prediction body', () => {
    const html = renderHtml(document([{ kind: 'quote', title: 't', body: 'one\ntwo' }]))
    expect(html).toContain('one<br />two')
  })

  it('escapes the subject, which ends up in the title element', () => {
    expect(renderHtml({ title: '5 > 4', blocks: [] })).toContain('<title>5 &gt; 4</title>')
  })
})

describe('every mail the service sends', () => {
  // The two halves are rendered separately, which is exactly how they drift apart. A link that
  // exists only in the HTML strands anybody whose client shows them the text part.
  it.each(MAIL_SAMPLES)('offers the same links in both halves: $name', (sample) => {
    const { text, html } = renderMail(sample.mail)

    for (const url of linksIn(sample.mail)) {
      expect(text).toContain(url)
      expect(html).toContain(url)
    }
  })

  it.each(MAIL_SAMPLES)('says what it is about before the body: $name', (sample) => {
    expect(sample.mail.title).not.toBe('')
    expect(sample.mail.preheader).toBeDefined()
  })
})

const linksIn = (mail: MailDocument): string[] =>
  mail.blocks
    .filter((block) => block.kind === 'button' || block.kind === 'link')
    .map((block) => block.url)
