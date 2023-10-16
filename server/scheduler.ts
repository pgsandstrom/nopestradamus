import {
  getOldBetWithUnsentCreaterAcceptMails,
  getOldBetWithUnsentCreaterEndMails,
  getOldBetWithUnsentParticipantsAcceptMails,
  getOldBetWithUnsentParticipantsEndMails,
  getPrediction,
  setCreaterAcceptMailSent,
  setCreaterEndMailSent,
  setParticipantAcceptMailSent,
  setParticipantEndMailSent,
} from './prediction'
import {
  sendCreaterAcceptMail,
  sendCreaterEndMail,
  sendParticipantAcceptMail,
  sendParticipantEndMail,
} from './mailer'
import { isMailValid } from '../shared/mail-util'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

export const handleAllUnsentMails = async () => {
  console.log('handle all unsent mails')
  await handleAllUnsentCreaterAcceptEmails()

  await handleAllUnsentParticipantsAcceptEmails()

  await handleAllUnsentCreaterEndEmails()

  await handleAllUnsentParticipantsEndEmails()
  console.log('completed handle all unsent mails')
}

const handleAllUnsentCreaterAcceptEmails = async () => {
  const unsentCreaterAcceptMails = await getOldBetWithUnsentCreaterAcceptMails()
  const promiseList = unsentCreaterAcceptMails.map(handleUnsentCreaterAcceptEmail)
  return Promise.all(promiseList)
}

const handleAllUnsentParticipantsAcceptEmails = async () => {
  const unsentAcceptMails = await getOldBetWithUnsentParticipantsAcceptMails()
  const promiseList = unsentAcceptMails.map(handleUnsentAcceptEmail)
  return Promise.all(promiseList)
}

const handleAllUnsentCreaterEndEmails = async () => {
  const unsentCreaterAcceptMails = await getOldBetWithUnsentCreaterEndMails()
  const promiseList = unsentCreaterAcceptMails.map(handleUnsentCreaterEndEmail)
  return Promise.all(promiseList)
}

const handleAllUnsentParticipantsEndEmails = async () => {
  const unsentEndMails = await getOldBetWithUnsentParticipantsEndMails()
  const promiseList = unsentEndMails.map(handleUnsentEndEmail)
  return Promise.all(promiseList)
}

export const handleUnsentCreaterAcceptEmail = async (predictionHash: string) => {
  const prediction = await getPrediction(predictionHash)

  if (prediction === undefined) {
    throw new Error(`Prediction not found: ${predictionHash}`)
  }

  const mail = prediction.creater.mail

  if (prediction.creater.accepted_mail_sent) {
    throw new Error(`created accept mail already sent for ${predictionHash}`)
  }
  try {
    let result: SMTPTransport.SentMessageInfo | undefined
    if (isMailValid(mail)) {
      result = await sendCreaterAcceptMail(prediction)
    } else {
      console.log(`creater skipping invalid mail: ${mail}`)
    }
    await setCreaterAcceptMailSent(prediction.creater.hash)
    return result
  } catch (e) {
    console.error(`failed sending creater accept mail to ${mail}`)
    throw e
  }
}

export const handleUnsentCreaterEndEmail = async (predictionHash: string) => {
  const prediction = await getPrediction(predictionHash)

  if (prediction === undefined) {
    throw new Error(`Prediction not found: ${predictionHash}`)
  }

  const mail = prediction.creater.mail

  if (prediction.creater.end_mail_sent) {
    throw new Error(`created end mail already sent for ${predictionHash}`)
  }
  try {
    if (isMailValid(mail)) {
      await sendCreaterEndMail(prediction)
    } else {
      console.log(`creater skipping invalid mail: ${mail}`)
    }
    await setCreaterEndMailSent(prediction.creater.hash)
  } catch (e) {
    console.error(`failed sending creater end mail to ${mail}`)
    throw e
  }
}

export const handleUnsentAcceptEmail = async (predictionHash: string) => {
  const prediction = await getPrediction(predictionHash)

  if (prediction === undefined) {
    throw new Error(`Prediction not found: ${predictionHash}`)
  }

  const participantNeedingMailList = prediction.participants.filter(
    (participant) => participant.accepted_mail_sent === false,
  )

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  participantNeedingMailList.forEach(async (participant) => {
    try {
      if (isMailValid(participant.mail)) {
        await sendParticipantAcceptMail(prediction, participant)
      } else {
        console.log(`participant skipping invalid mail: ${participant.mail}`)
      }
      await setParticipantAcceptMailSent(participant.hash)
    } catch (e) {
      console.error(`failed sending accept mail to ${participant.mail}`)
      throw e
    }
  })
}

const handleUnsentEndEmail = async (predictionHash: string) => {
  const prediction = await getPrediction(predictionHash)

  if (prediction === undefined) {
    throw new Error(`Prediction not found: ${predictionHash}`)
  }

  const participantNeedingMailList = prediction.participants
    .filter((participant) => participant.accepted)
    .filter((participant) => participant.end_mail_sent === false)

  const promiseList = participantNeedingMailList.map(async (participant) => {
    try {
      if (isMailValid(participant.mail)) {
        await sendParticipantEndMail(prediction, participant)
      } else {
        console.log(`endmail skipping invalid mail: ${participant.mail}`)
      }
      await setParticipantEndMailSent(participant.hash)
    } catch (e) {
      console.error(`failed sending end mail to ${participant.mail}`)
      throw e
    }
  })
  return Promise.all(promiseList)
}
