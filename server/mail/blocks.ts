/**
 * What a mail is made of, before it is a mail.
 *
 * Every mail has to go out twice — once as HTML for the mail clients that want it, once as plain
 * text for the ones that do not and for the spam filters that compare the two. Writing both by
 * hand means writing every mail twice and watching the copies drift apart. So a mail is written
 * once as a list of blocks, and `render-text.ts` and `render-html.ts` each turn that into their
 * own format.
 *
 * Anything you want to say has to fit one of these kinds, which is the point: it keeps the mails
 * looking like each other, and it keeps the styling decisions out of the mail texts.
 */
export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  /** The prediction itself, set apart from the words around it. */
  | { kind: 'quote'; title: string; body: string }
  /** The table: short label, short value, one pair per row. */
  | { kind: 'facts'; rows: Fact[] }
  | { kind: 'people'; label: string; mails: string[] }
  /** The one thing the mail wants you to do. At most one per mail. */
  | { kind: 'button'; label: string; url: string }
  /** A quieter link, for the things a mail has to offer but is not asking for. */
  | { kind: 'link'; label: string; url: string }
  /** Small print: expiry times, "if that was not you", the unsubscribe line. */
  | { kind: 'note'; text: string }
  | { kind: 'divider' }

export interface Fact {
  label: string
  value: string
}

/**
 * A written mail. `sendMail` renders it; the previews render it too, which is what makes them
 * previews rather than a second implementation of the same mails.
 */
export interface MailDocument {
  title: string
  /**
   * The grey line a mail client shows after the subject in the inbox list. Without one it shows
   * the first words of the body instead, which is usually the heading repeated.
   */
  preheader?: string
  blocks: Block[]
}

/**
 * A mail with nothing in it but typed-out text — the admin console's test mail. Blank lines
 * separate paragraphs, the same as anywhere else somebody types into a box.
 */
export const textDocument = (title: string, body: string): MailDocument => ({
  title,
  blocks: body
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .map((text) => ({ kind: 'paragraph', text })),
})
