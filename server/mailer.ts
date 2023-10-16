import nodemailer from 'nodemailer'
import { getPrivateKey } from '../util/config'
import { isDev } from '../util/env'
import { getAccountByHash, getAccountHashByMail } from './account'
import { formatDateString } from '../shared/date-util'

const getPredictionList = (prediction: Prediction): string => {
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

export const sendCreaterAcceptMail = async (prediction: Prediction) => {
  console.log(`sending creater accept mail to ${prediction.creater.mail}`)

  const mailTitle = 'Nopestradamus: Validate your mail for your prediction!'
  const mailBody = `Below is the bet that was created by this mail:

---

Title: ${prediction.title}

${prediction.body}
${getPredictionList(prediction)}
---

To start the prediction you must visit the following link and accept it:
http://nopestradamus.com/prediction/${prediction.hash}/creater/${prediction.creater.hash}
`
  return sendMail(prediction.creater.mail, mailTitle, mailBody)
}

export const sendParticipantAcceptMail = async (
  prediction: Prediction,
  participant: Participant,
) => {
  console.log(`sending accept mail to ${participant.mail}`)
  const mailTitle = `Your opinion has been requested by ${prediction.creater.mail}!`
  const mailBody = `${
    prediction.creater.mail
  } has asked you to accept a prediction! The prediction is described below.

---

Title: ${prediction.title}

${prediction.body}
${getPredictionList(prediction)}
---

The prediction ends at ${formatDateString(
    prediction.finish_date,
  )}. At the given date, you will all receive a mail and be confronted with your predictions!

Click here to view the prediction and decide if you want to accept or reject it:
http://nopestradamus.com/prediction/${prediction.hash}/participant/${participant.hash}
`
  return sendMail(participant.mail, mailTitle, mailBody)
}

export const sendCreaterEndMail = async (prediction: Prediction) => {
  const mailTitle = `Your bet has finished: ${prediction.title}`
  const mailBody = `A bet was created by you on ${formatDateString(
    prediction.created,
  )}. It has now finished! Here is the bet:

---

Title: ${prediction.title}

${prediction.body}
${getPredictionList(prediction)}
---

To get an overview of the bet visit this link:
http://nopestradamus.com/prediction/${prediction.hash}

Hope you had fun!`
  // TODO reminders about who was involved and stuff like that
  return sendMail(prediction.creater.mail, mailTitle, mailBody)
}

export const sendParticipantEndMail = async (prediction: Prediction, participant: Participant) => {
  console.log(`sending end mail to ${participant.mail}`)

  const mailTitle = `Your bet from ${prediction.creater.mail} has finished!`
  const mailBody = `A bet was accepted by you on ${formatDateString(
    participant.accepted_date,
  )} by ${prediction.creater.mail}. It has now finished! Here is the bet:

---

Title: ${prediction.title}

${prediction.body}
${getPredictionList(prediction)}
---

To get an overview of the bet visit this link:
http://nopestradamus.com/prediction/${prediction.hash}

Now you must discuss who won the bet!`
  return sendMail(participant.mail, mailTitle, mailBody)
}

export const sendMail = async (receiver: string, title: string, rawBody: string) => {
  const blockmeFooter = await getBlockMeFooter(receiver)
  const body = `${rawBody}

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
    subject: title,
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
