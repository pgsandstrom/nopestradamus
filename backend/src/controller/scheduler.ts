import {
  getOldBetWithUnsentParticipantsAcceptMails,
  getOldBetWithUnsentParticipantsEndMails,
  getPrediction,
  getOldBetWithUnsentCreaterAcceptMails,
  setCreaterAcceptMailSent,
  setParticipantAcceptMailSent,
  setParticipantEndMailSent,
} from './prediction'
import { sendAcceptMail, sendCreaterAcceptMail, sendEndMail } from './mailer'
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
  unsentCreaterAcceptMails.forEach((item) => handleUnsentCreaterAcceptEmail(item.hash))
}

const handleAllUnsentParticipantsAcceptEmails = async () => {
  const unsentAcceptMails = await getOldBetWithUnsentParticipantsAcceptMails()
  unsentAcceptMails.forEach((item) => handleUnsentAcceptEmail(item.hash))
}

const handleAllUnsentCreaterEndEmails = async () => {
  // TODO
}

const handleAllUnsentParticipantsEndEmails = async () => {
  const unsentEndMails = await getOldBetWithUnsentParticipantsEndMails()
  unsentEndMails.forEach((item) => handleUnsentEndEmail(item.hash))
}

export const handleUnsentCreaterAcceptEmail = async (hash: string) => {
  const prediction = await getPrediction(hash)
  const mail = prediction.creater.mail
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

export const handleUnsentAcceptEmail = async (hash: string) => {
  const prediction = await getPrediction(hash)
  const createrMail = prediction.creater.mail
  const mails = prediction.participants
    .filter((participant) => participant.accepted_mail_sent === false)
    .map((participant) => participant.mail)
  mails.forEach(async (mail) => {
    // TODO i think this can be written in a nicer way...
    const participant = prediction.participants.find((p) => p.mail === mail)!
    try {
      if (isMailValid(mail)) {
        await sendAcceptMail(
          mail,
          createrMail,
          prediction.title,
          prediction.body,
          prediction.finish_date,
          hash,
          participant.hash,
        )
      } else {
        console.log(`participant skipping invalid mail: ${mail}`)
      }
      await setParticipantAcceptMailSent(participant.hash)
    } catch (e) {
      console.error(`failed sending accept mail to ${mail}`)
    }
  })
}

const handleUnsentEndEmail = async (predictionHash: string) => {
  const prediction = await getPrediction(predictionHash)
  const createrMail = prediction.creater.mail
  const participantNeedingMailList = prediction.participants
    .filter((participant) => participant.accepted)
    .filter((participant) => participant.end_mail_sent === false)
  participantNeedingMailList.forEach(async (participant) => {
    const mail = participant.mail
    try {
      if (isMailValid(mail)) {
        await sendEndMail(
          mail,
          createrMail,
          prediction.title,
          prediction.body,
          participant.accepted_date!,
          predictionHash,
        )
      } else {
        console.log(`endmail skipping invalid mail: ${mail}`)
      }
      setParticipantEndMailSent(participant.hash)
    } catch (e) {
      console.error(`failed sending end mail to ${mail}`)
    }
  })
}
