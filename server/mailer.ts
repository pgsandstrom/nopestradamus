import nodemailer from 'nodemailer'
import { getPrivateKey } from '../util/config'
import { isDev } from '../util/env'
import { getAccountByHash, getAccountHashByMail } from './account'
import { formatDateString } from '../shared/date-util'

export interface Mail {
  title: string
  body: string
}

export const getCreaterAcceptMail = (prediction: Prediction): Mail => {
  const title = 'Nopestradamus: Validate your mail for your prediction!'
  const body = `Below is the bet that was created by this mail:

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

To start the prediction you must visit the following link and accept it:
http://nopestradamus.com/prediction/${prediction.hash}/creater/${prediction.creater.hash}
`

  return { title, body }
}

export const getParticipantAcceptMail = (
  prediction: Prediction,
  participant: Participant,
): Mail => {
  const title = `Your opinion has been requested by ${prediction.creater.mail}!`
  const body = `${
    prediction.creater.mail
  } has asked you to accept a prediction! The prediction is described below.

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

The prediction ends at ${formatDateString(
    prediction.finish_date,
  )}. At the given date, you will all receive a mail and be confronted with your predictions!

Click here to view the prediction and decide if you want to accept or reject it:
http://nopestradamus.com/prediction/${prediction.hash}/participant/${participant.hash}
`

  return {
    title,
    body,
  }
}

export const getCreaterEndMail = (prediction: Prediction): Mail => {
  const title = `Your bet has finished: ${prediction.title}`
  const body = `A bet was created by you on ${formatDateString(
    prediction.created,
  )}. It has now finished! Here is the bet:

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

To get an overview of the bet visit this link:
http://nopestradamus.com/prediction/${prediction.hash}

Hope you had fun!`
  // TODO reminders about who was involved and stuff like that
  return {
    title,
    body,
  }
}

export const getParticipantEndMail = (prediction: Prediction, participant: Participant): Mail => {
  const title = `Your bet from ${prediction.creater.mail} has finished!`
  const body = `A bet was accepted by you on ${formatDateString(participant.accepted_date)} by ${
    prediction.creater.mail
  }. It has now finished! Here is the bet:

---

Title: ${prediction.title}

${prediction.body}
${getParticipantList(prediction)}
---

To get an overview of the bet visit this link:
http://nopestradamus.com/prediction/${prediction.hash}

Now you must discuss who won the bet!`

  return {
    title,
    body,
  }
}

export const sendMail = async (receiver: string, mail: Mail) => {
  const blockmeFooter = await getBlockMeFooter(receiver)
  const body = `${mail.body}

${blockmeFooter}`

  const accountHash = await getAccountHashByMail(receiver)
  const account = await getAccountByHash(accountHash)

  if (account.blocked) {
    console.log(`${account.mail} is blocked, not sending mail`)
    return
  }

  if (isDev()) {
    console.log('faking sending mail')
    return
  }

  const privateKey = getPrivateKey()
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    ignoreTLS: true,
    dkim: {
      domainName: 'nopestradamus.com',
      keySelector: 'hej',
      privateKey,
    },
    // tls: {
    // rejectUnauthorized: false, // do not fail on invalid certs
    // },
  })

  const mailOptions = {
    from: '"Nopestradamus" <no-reply@nopestradamus.com>',
    to: [receiver],
    subject: mail.title,
    text: body,
    // html: body,
  }

  try {
    await transporter.verify()
    const result = await transporter.sendMail(mailOptions)
    console.log(`Sent mail: "${result.response}"`)
    return result
  } catch (e) {
    console.error(`send mail fail: ${JSON.stringify(e)}`)
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

const getBlockMeFooter = async (mail: string) => {
  const hash = await getAccountHashByMail(mail)

  return `---

Dont want to receive these mails? Block yourself here:
http://nopestradamus.com/blockme/${hash}`
}
