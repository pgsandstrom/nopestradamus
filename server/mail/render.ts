import type { MailDocument } from './blocks.ts'
import { renderHtml } from './render-html.ts'
import { renderText } from './render-text.ts'

/** A mail in the two shapes it goes out in. Both halves say the same thing. */
export interface RenderedMail {
  title: string
  text: string
  html: string
}

/**
 * Turns a written mail into what is actually sent. The previews call this too, which is the whole
 * point of them: what you look at in `/dev/mails` is the mail, not a drawing of it.
 */
export const renderMail = (mail: MailDocument): RenderedMail => ({
  title: mail.title,
  text: renderText(mail),
  html: renderHtml(mail),
})
