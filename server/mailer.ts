import nodemailer from 'nodemailer'

import type { Participant, Prediction } from '../shared/index.ts'
import { formatDateString } from '../shared/date-util.ts'
import { getPrivateKey } from '../util/config.ts'
import { isDev } from '../util/env.ts'
import { getAccountByHash, getAccountHashByMail } from './account.ts'

const SITE_URL = 'https://nopestradamus.com'

export interface Mail {
  title: string
  body: string
}

export const getCreaterAcceptMail = (prediction: Prediction): Mail => ({
  title: 'Nopestradamus: Validate your mail for your prediction!',
  body: `Below is the bet that was created by this mail:

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

To start the prediction you must visit the following link and accept it:
${SITE_URL}/prediction/${prediction.hash}/creater/${prediction.creater.hash}
`,
})

export const getParticipantAcceptMail = (
  prediction: Prediction,
  participant: Participant,
): Mail => ({
  title: `Your opinion has been requested by ${prediction.creater.mail}!`,
  body: `${prediction.creater.mail} has asked you to accept a prediction! The prediction is described below.

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

The prediction ends at ${formatDateString(prediction.finish_date)}. At the given date, you will all receive a mail and be confronted with your predictions!

Click here to view the prediction and decide if you want to accept or reject it:
${SITE_URL}/prediction/${prediction.hash}/participant/${participant.hash}
`,
})

export const getCreaterEndMail = (prediction: Prediction): Mail => ({
  title: `Your bet has finished: ${prediction.title}`,
  body: `A bet was created by you on ${formatDateString(prediction.created)}. It has now finished! Here is the bet:

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

To get an overview of the bet visit this link:
${SITE_URL}/prediction/${prediction.hash}

Hope you had fun!`,
})

export const getParticipantEndMail = (prediction: Prediction, participant: Participant): Mail => ({
  title: `Your bet from ${prediction.creater.mail} has finished!`,
  body: `A bet was accepted by you on ${formatDateString(participant.accepted_date)} by ${prediction.creater.mail}. It has now finished! Here is the bet:

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

To get an overview of the bet visit this link:
${SITE_URL}/prediction/${prediction.hash}

Now you must discuss who won the bet!`,
})

export const sendMail = async (receiver: string, mail: Mail, overrideBlock = false) => {
  const accountHash = await getAccountHashByMail(receiver)

  if (!overrideBlock) {
    const account = await getAccountByHash(accountHash)
    if (account?.blocked === true) {
      console.log(`${account.mail} is blocked, not sending mail`)
      return
    }
  }

  const body = `${mail.body}

${getBlockMeFooter(accountHash)}`

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
      subject: mail.title,
      text: body,
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

const getParticipantList = (prediction: Prediction): string => {
  if (prediction.participants.length === 0) {
    return ''
  }
  return `---

Here are the participants:

${prediction.participants.map((p) => p.mail).join('\n')}`
}

const getBlockMeFooter = (accountHash: string): string => `---

Dont want to receive these mails? Block yourself here:
${SITE_URL}/blockme/${accountHash}`
