import nodemailer from 'nodemailer'

import { getPrivateKey } from '../util/config.ts'
import { isDev } from '../util/env.ts'
import { getAccountByHash, getAccountHashByMail } from './account.ts'
import type { MailDocument } from './mail/blocks.ts'
import { renderMail } from './mail/render.ts'
import { SITE_URL } from './mail/site.ts'
import { withUnsubscribeFooter } from './mail/templates.ts'

/**
 * Sending. What the mails say lives in `mail/templates.ts`, and how they look in `mail/render-*`;
 * this file only knows how to put one on the wire.
 */
export const sendMail = async (receiver: string, mail: MailDocument, overrideBlock = false) => {
  const accountHash = await getAccountHashByMail(receiver)

  if (!overrideBlock) {
    const account = await getAccountByHash(accountHash)
    if (account?.blocked === true) {
      console.log(`${account.mail} is blocked, not sending mail`)
      return
    }
  }

  // both halves carry the footer: a recipient reading the plain-text part still has to be able to
  // get out
  const { title, text, html } = renderMail(withUnsubscribeFooter(mail, accountHash))

  if (isDev()) {
    console.log('faking sending mail')
    return
  }

  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    name: 'nopestradamus.com',
    secure: false,
    ignoreTLS: true,
    dkim: {
      domainName: 'nopestradamus.com',
      keySelector: 'hej',
      privateKey: getPrivateKey(),
    },
  })

  const unsubscribeUrl = `${SITE_URL}/api/account/${accountHash}/block`

  try {
    await transporter.verify()
    const result = await transporter.sendMail({
      from: '"Nopestradamus" <no-reply@nopestradamus.com>',
      to: [receiver],
      subject: title,
      // nodemailer turns the pair into multipart/alternative. Both are required: a mail with no
      // text part scores worse with spam filters, and some clients are still set to show it.
      text,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    console.log(`Sent mail: "${result.response}"`)
    return result
  } catch (e) {
    console.error(`send mail fail: ${String(e)}`)
    throw e
  }
}
