import {
  getOldBetWithUnsentParticipantsAcceptMails,
  getOldBetWithUnsentParticipantsEndMails,
  getPrediction,
  getOldBetWithUnsentCreaterAcceptMails,
  setCreaterAcceptMailSent,
  setParticipantAcceptMailSent,
  setParticipantEndMailSent,
  getOldBetWithUnsentCreaterEndMails,
} from './prediction'
import {
  sendParticipantAcceptMail,
  sendCreaterAcceptMail,
  sendParticipantEndMail,
  sendCreaterEndMail,
} from './mailer'
import { isMailValid } from '../util/mail-util'

export const handleAllUnsentMails = async () => {
  console.log('handle all unsent mails')
  await handleAllUnsentCreaterAcceptEmails()

  await handleAllUnsentParticipantsAcceptEmails()

  await handleAllUnsentCreaterEndEmails()

  await handleAllUnsentParticipantsEndEmails()
}

const handleAllUnsentCreaterAcceptEmails = async () => {
  const unsentCreaterAcceptMails = await getOldBetWithUnsentCreaterAcceptMails()
  unsentCreaterAcceptMails.forEach(handleUnsentCreaterAcceptEmail)
}

const handleAllUnsentParticipantsAcceptEmails = async () => {
  const unsentAcceptMails = await getOldBetWithUnsentParticipantsAcceptMails()
  unsentAcceptMails.forEach(handleUnsentAcceptEmail)
}

const handleAllUnsentCreaterEndEmails = async () => {
  const unsentCreaterAcceptMails = await getOldBetWithUnsentCreaterEndMails()
  unsentCreaterAcceptMails.forEach(handleUnsentCreaterEndEmail)
}

const handleAllUnsentParticipantsEndEmails = async () => {
  const unsentEndMails = await getOldBetWithUnsentParticipantsEndMails()
  unsentEndMails.forEach(handleUnsentEndEmail)
}

export const handleUnsentCreaterAcceptEmail = async (hash: string) => {
  const prediction = await getPrediction(hash)
  const mail = prediction.creater.mail

  if (prediction.creater.accepted_mail_sent) {
    throw new Error(`created accept mail already sent for ${hash}`)
  }
  try {
    if (isMailValid(mail)) {
      await sendCreaterAcceptMail(prediction)
    } else {
      console.log(`creater skipping invalid mail: ${mail}`)
    }
    await setCreaterAcceptMailSent(prediction.creater.hash)
  } catch (e) {
    console.error(`failed sending creater accept mail to ${mail}`)
  }
}

export const handleUnsentCreaterEndEmail = async (hash: string) => {
  const prediction = await getPrediction(hash)
  const mail = prediction.creater.mail

  if (prediction.creater.end_mail_sent) {
    throw new Error(`created end mail already sent for ${hash}`)
  }
  try {
    if (isMailValid(mail)) {
      await sendCreaterEndMail(prediction)
    } else {
      console.log(`creater skipping invalid mail: ${mail}`)
    }
    await setCreaterAcceptMailSent(prediction.creater.hash)
  } catch (e) {
    console.error(`failed sending creater end mail to ${mail}`)
  }
}

export const handleUnsentAcceptEmail = async (hash: string) => {
  const prediction = await getPrediction(hash)

  const participantNeedingMailList = prediction.participants.filter(
    (participant) => participant.accepted_mail_sent === false,
  )

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
    }
  })
}

const handleUnsentEndEmail = async (predictionHash: string) => {
  const prediction = await getPrediction(predictionHash)

  const participantNeedingMailList = prediction.participants
    .filter((participant) => participant.accepted)
    .filter((participant) => participant.end_mail_sent === false)

  participantNeedingMailList.forEach(async (participant) => {
    try {
      if (isMailValid(participant.mail)) {
        await sendParticipantEndMail(prediction, participant)
      } else {
        console.log(`endmail skipping invalid mail: ${participant.mail}`)
      }
      setParticipantEndMailSent(participant.hash)
    } catch (e) {
      console.error(`failed sending end mail to ${participant.mail}`)
    }
  })
}
