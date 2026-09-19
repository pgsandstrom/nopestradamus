import type { Block, Fact, MailDocument } from './blocks.ts'
import { SITE_URL } from './site.ts'

/**
 * The HTML half of every mail.
 *
 * Mail clients are not browsers. Outlook renders with Word, Gmail throws away most of a `<style>`
 * block, and neither can be relied on for flexbox, grid or even `div` margins. So this is written
 * the way mail has been written for twenty years: nested tables for layout, a fixed 600px column,
 * and a `style` attribute on every element that needs one. Nothing here is cargo cult — take the
 * inline styles off and the mail falls apart in Outlook.
 *
 * The colours are the tokens from `app/globals.css`, copied as literals because a mail cannot
 * reach a stylesheet. When those change, change these.
 */
const COLOR = {
  bg: '#f1f5f9',
  surface: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#cbd5e1',
  primary: '#556cd6',
  quote: '#f8fafc',
}

const FONT =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'"

export const renderHtml = (mail: MailDocument): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<!-- both, because clients disagree on which one they read; a mail that opts out of dark mode
     keeps the colours below instead of having them inverted by the client -->
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(mail.title)}</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${COLOR.bg};-webkit-font-smoothing:antialiased;">
${renderPreheader(mail.preheader)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.bg};">
<tr>
<td align="center" style="padding:24px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:${COLOR.surface};border:1px solid ${COLOR.border};border-radius:6px;">
${renderBrand()}
${mail.blocks.map(renderBlock).join('\n')}
<tr><td style="padding:8px 32px 28px;"></td></tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`

/**
 * The grey line an inbox shows after the subject. Hidden in the mail itself — the run of
 * zero-width characters after it stops the client from padding the preview out with whatever the
 * first real text turns out to be.
 */
const renderPreheader = (preheader?: string): string =>
  preheader === undefined
    ? ''
    : `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escapeHtml(preheader)}${'&#8203;&#847;'.repeat(60)}</div>`

const renderBrand = (): string => `<tr>
<td style="padding:24px 32px 20px;border-bottom:1px solid ${COLOR.border};">
<a href="${SITE_URL}" style="color:${COLOR.primary};font-family:${FONT};font-size:17px;font-weight:600;letter-spacing:-0.01em;text-decoration:none;">Nopestradamus</a>
</td>
</tr>`

const renderBlock = (block: Block): string => {
  switch (block.kind) {
    case 'heading':
      return row(
        `<h1 style="margin:0;color:${COLOR.text};font-family:${FONT};font-size:21px;font-weight:600;line-height:1.3;">${escapeHtml(block.text)}</h1>`,
        '24px 32px 4px',
      )
    case 'paragraph':
      return row(paragraph(block.text, COLOR.text, '15px'))
    case 'note':
      return row(paragraph(block.text, COLOR.muted, '13px'))
    case 'quote':
      return renderQuote(block.title, block.body)
    case 'facts':
      return renderFacts(block.rows)
    case 'people':
      return renderPeople(block.label, block.mails)
    case 'button':
      return renderButton(block.label, block.url)
    case 'link':
      return row(
        `<p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;"><a href="${escapeHtml(block.url)}" style="color:${COLOR.primary};text-decoration:underline;">${escapeHtml(block.label)}</a></p>`,
      )
    case 'divider':
      return row(
        `<hr style="height:1px;margin:0;border:0;background-color:${COLOR.border};" />`,
        '8px 32px 16px',
      )
  }
}

const row = (content: string, padding = '0 32px 16px'): string =>
  `<tr><td style="padding:${padding};">${content}</td></tr>`

const paragraph = (text: string, color: string, size: string): string =>
  `<p style="margin:0;color:${color};font-family:${FONT};font-size:${size};line-height:1.6;">${escapeHtml(text).replaceAll('\n', '<br />')}</p>`

/** The prediction or a comment, set on its own card so it reads as the thing quoted rather than as us. */
const renderQuote = (title: string | undefined, body: string): string =>
  row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.quote};border:1px solid ${COLOR.border};border-radius:6px;">
<tr><td style="padding:18px 20px;">
${title === undefined ? '' : `<p style="margin:0 0 8px;color:${COLOR.text};font-family:${FONT};font-size:16px;font-weight:600;line-height:1.4;">${escapeHtml(title)}</p>\n`}<p style="margin:0;color:${COLOR.text};font-family:${FONT};font-size:15px;line-height:1.6;">${escapeHtml(body).replaceAll('\n', '<br />')}</p>
</td></tr>
</table>`)

const renderFacts = (rows: Fact[]): string =>
  row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
${rows
  .map(
    (fact, index) => `<tr>
<td style="padding:8px 12px 8px 0;${index === 0 ? '' : `border-top:1px solid ${COLOR.border};`}color:${COLOR.muted};font-family:${FONT};font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(fact.label)}</td>
<td align="right" style="padding:8px 0;${index === 0 ? '' : `border-top:1px solid ${COLOR.border};`}color:${COLOR.text};font-family:${FONT};font-size:14px;font-weight:500;vertical-align:top;">${escapeHtml(fact.value)}</td>
</tr>`,
  )
  .join('\n')}
</table>`)

const renderPeople = (label: string, mails: string[]): string =>
  row(`<p style="margin:0 0 8px;color:${COLOR.muted};font-family:${FONT};font-size:13px;">${escapeHtml(label)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
${mails
  .map(
    (mail) =>
      `<tr><td style="padding:6px 0;color:${COLOR.text};font-family:${FONT};font-size:14px;word-break:break-all;">${escapeHtml(mail)}</td></tr>`,
  )
  .join('\n')}
</table>`)

/**
 * A button that is really a table: Outlook ignores padding on an anchor, so the colour and the
 * shape belong to the cell around it. The URL is repeated underneath as text, because a mail
 * client that blocks the button still has to leave the recipient a way in.
 */
const renderButton = (label: string, url: string): string =>
  row(`<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" bgcolor="${COLOR.primary}" style="border-radius:6px;">
<a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;line-height:1;text-decoration:none;">${escapeHtml(label)}</a>
</td></tr>
</table>
<p style="margin:12px 0 0;color:${COLOR.muted};font-family:${FONT};font-size:12px;line-height:1.5;word-break:break-all;">Or paste this into your browser:<br /><a href="${escapeHtml(url)}" style="color:${COLOR.muted};text-decoration:underline;">${escapeHtml(url)}</a></p>`)

/**
 * Prediction titles and bodies are typed in by visitors and land in this HTML. Escaping is not
 * cosmetic: an unescaped `<` is how somebody else's mail client ends up running somebody else's
 * markup.
 */
export const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
