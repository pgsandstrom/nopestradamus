import type { Block, MailDocument } from './blocks.ts'

/**
 * The plain-text half of every mail. It is not a fallback nobody reads: a message with no text
 * part scores worse with spam filters than one with, and a mail client set to plain text shows
 * this and nothing else. Every link that appears as a button in the HTML has to appear here as a
 * URL somebody can copy.
 */
export const renderText = (mail: MailDocument): string =>
  `${mail.blocks.map(renderBlock).join('\n\n')}\n`

const RULE = '---'

/**
 * Plain-text mail is not reflowed by the client, so a paragraph that is one long line stays one
 * long line — off the right of a narrow window, or wrapped at wherever the client feels like it.
 * 78 is the usual choice: it leaves room for a couple of levels of `>` when somebody replies.
 */
const WIDTH = 78

const renderBlock = (block: Block): string => {
  switch (block.kind) {
    case 'heading':
      // underlined rather than shouted: an all-caps line reads as shouting, and some filters
      // count capitals
      return `${block.text}\n${'='.repeat(block.text.length)}`
    case 'paragraph':
    case 'note':
      return wrap(block.text)
    case 'quote':
      return block.title === undefined
        ? `${RULE}\n\n${wrap(block.body)}\n\n${RULE}`
        : `${RULE}\n\nTitle: ${wrap(block.title)}\n\n${wrap(block.body)}\n\n${RULE}`
    case 'facts':
      return renderFacts(block.rows)
    case 'people':
      return `${block.label}\n\n${block.mails.join('\n')}`
    case 'button':
    case 'link':
      return `${block.label}:\n${block.url}`
    case 'divider':
      return RULE
  }
}

/**
 * Wraps to {@link WIDTH}, one line at a time so that line breaks somebody typed deliberately —
 * the blank line between two halves of a prediction, say — survive. A word longer than the width
 * is left alone rather than broken: it is usually a URL, and a broken URL is not a URL.
 */
const wrap = (text: string): string =>
  text
    .split('\n')
    .map((line) =>
      line.split(' ').reduce((wrapped, word) => {
        const current = wrapped.slice(wrapped.lastIndexOf('\n') + 1)
        if (wrapped === '') {
          return word
        }
        return current.length + word.length + 1 > WIDTH
          ? `${wrapped}\n${word}`
          : `${wrapped} ${word}`
      }, ''),
    )
    .join('\n')

/** The HTML table, as the closest thing plain text has: labels padded to a common width. */
const renderFacts = (rows: { label: string; value: string }[]): string => {
  const width = Math.max(...rows.map((row) => row.label.length))
  return rows.map((row) => `${`${row.label}:`.padEnd(width + 2)}${row.value}`).join('\n')
}
