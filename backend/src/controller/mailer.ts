import nodemailer from 'nodemailer'
import { getPrivateKey } from '../util/config'
import { isDev } from '../util/env'
import { formatDateString } from '../../../frontend/shared/date-util'

export const sendCreaterAcceptMail = async (prediction: Prediction) => {
  console.log(`sending creater accept mail to ${prediction.creater.mail}`)
  // console.log(`accept: /prediction/${prediction.hash}/creater/${prediction.creater.hash}`);
  // console.log(`view: /prediction/${prediction.hash}`);
  const mailTitle = 'Nopestradamus: Validate your mail for your bet!'
  const mailBody = `Below is the bet that was created by this mail:

---

Title: ${prediction.title}

${prediction.body}

---

To validate or deny this prediction, visit the following link:
http://nopestradamus.com/prediction/${prediction.hash}/creater/${prediction.creater.hash}

To get an overview of the bet before you accept visit this link:
http://nopestradamus.com/prediction/${prediction.hash}`
  return sendMail(prediction.creater.mail, mailTitle, mailBody)
}

export const sendParticipantAcceptMail = async (
  prediction: Prediction,
  participant: Participant,
) => {
  console.log(`sending accept mail to ${participant.mail}`)
  // console.log(`accept: /prediction/${predictionHash}/participant/${acceptHash}`);
  // console.log(`view: /prediction/${predictionHash}`);
  const mailTitle = `Your opinion has been requested by ${prediction.creater.mail}!`
  const mailBody = `${
    prediction.creater.mail
  } has asked you to accept a bet! The bet is described below

---

Title: ${prediction.title}

${prediction.body}

---

The bet ends at ${formatDateString(
    prediction.finish_date,
  )}. At the given date, you will all receive a mail and be confronted with your predictions!
To accept or deny the bet, click the following link:
http://nopestradamus.com/prediction/${prediction.hash}/participant/${participant.hash}

To get an overview of the bet before you accept
http://nopestradamus.com/prediction/${prediction.hash}
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

---

To get an overview of the bet visit this link:
http://nopestradamus.com/prediction/${prediction.hash}

Hope you had fun!`
  // TODO reminders about who was involved and stuff like that
  return sendMail(prediction.creater.mail, mailTitle, mailBody)
}

export const sendParticipantEndMail = async (prediction: Prediction, participant: Participant) => {
  console.log(`sending end mail to ${participant.mail}`)
  const mailTitle = `Your bet from ${prediction.creater.mail} has finished!!!`
  const mailBody = `A bet was accepted by you on ${formatDateString(
    participant.accepted_date!,
  )} by ${prediction.creater.mail}. It has now finished! Here is the bet:

---

Title: ${prediction.title}

${prediction.body}

---

To get an overview of the bet visit this link:
http://nopestradamus.com/prediction/${prediction.hash}

Now you must discuss who won the bet!`
  return sendMail(participant.mail, mailTitle, mailBody)
}

export const sendMail = async (receiver: string, title: string, body: string) => {
  if (isDev()) {
    console.log('faking sending mail')
    return Promise.resolve()
  }

  const privateKey = getPrivateKey()
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    dkim: {
      domainName: 'nopestradamus.com',
      keySelector: 'hej',
      privateKey,
    },
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
    return transporter.sendMail(mailOptions)
  } catch (e) {
    console.error(`send mail fail: ${JSON.stringify(e)}`)
    throw e
  }
}
