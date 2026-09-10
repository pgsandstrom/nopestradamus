import { formatDateTime } from '../shared/date-util.ts'
import { isMailValid } from '../shared/mail-util.ts'
import {
  getCreaterAcceptMail,
  getCreaterEndMail,
  getParticipantAcceptMail,
  getParticipantEndMail,
  sendMail,
} from './mailer.ts'
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
} from './prediction.ts'

export const handleAllUnsentMails = async (): Promise<void> => {
  console.log('handle all unsent mails', formatDateTime(new Date()))
  await handleAll(getOldBetWithUnsentCreaterAcceptMails, handleUnsentCreaterAcceptEmail)
  await handleAll(getOldBetWithUnsentParticipantsAcceptMails, handleUnsentAcceptEmail)
  await handleAll(getOldBetWithUnsentCreaterEndMails, handleUnsentCreaterEndEmail)
  await handleAll(getOldBetWithUnsentParticipantsEndMails, handleUnsentEndEmail)
  console.log('completed handle all unsent mails')
}

const handleAll = async (
  getPredictionHashes: () => Promise<string[]>,
  handle: (predictionHash: string) => Promise<void>,
): Promise<void> => {
  const predictionHashes = await getPredictionHashes()
  await Promise.all(predictionHashes.map(handle))
}

const requirePrediction = async (predictionHash: string) => {
  const prediction = await getPrediction(predictionHash)
  if (prediction === undefined) {
    throw new Error(`Prediction not found: ${predictionHash}`)
  }
  return prediction
}

export const handleUnsentCreaterAcceptEmail = async (predictionHash: string): Promise<void> => {
  const prediction = await requirePrediction(predictionHash)
  const { mail, hash } = prediction.creater

  if (prediction.creater.accepted_mail_sent) {
    throw new Error(`created accept mail already sent for ${predictionHash}`)
  }
  try {
    if (isMailValid(mail)) {
      console.log(`sending creater accept mail to ${mail}`)
      await sendMail(mail, getCreaterAcceptMail(prediction))
    } else {
      console.log(`creater skipping invalid mail: ${mail}`)
    }
    await setCreaterAcceptMailSent(hash)
  } catch (e) {
    console.error(`failed sending creater accept mail to ${mail}`)
    throw e
  }
}

const handleUnsentCreaterEndEmail = async (predictionHash: string): Promise<void> => {
  const prediction = await requirePrediction(predictionHash)
  const { mail, hash } = prediction.creater

  if (prediction.creater.end_mail_sent) {
    throw new Error(`created end mail already sent for ${predictionHash}`)
  }
  try {
    if (isMailValid(mail)) {
      await sendMail(mail, getCreaterEndMail(prediction))
    } else {
      console.log(`creater skipping invalid mail: ${mail}`)
    }
    await setCreaterEndMailSent(hash)
  } catch (e) {
    console.error(`failed sending creater end mail to ${mail}`)
    throw e
  }
}

export const handleUnsentAcceptEmail = async (predictionHash: string): Promise<void> => {
  const prediction = await requirePrediction(predictionHash)

  const participantNeedingMailList = prediction.participants.filter(
    (participant) => participant.accepted_mail_sent === false,
  )

  // NOTE: these are deliberately not awaited, which is how this has always behaved.
  // It means the caller returns before the mails are actually sent, and a failure here
  // surfaces as an unhandled rejection rather than an error the caller can see.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  participantNeedingMailList.forEach(async (participant) => {
    try {
      if (isMailValid(participant.mail)) {
        console.log(`sending accept mail to ${participant.mail}`)
        await sendMail(participant.mail, getParticipantAcceptMail(prediction, participant))
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

const handleUnsentEndEmail = async (predictionHash: string): Promise<void> => {
  const prediction = await requirePrediction(predictionHash)

  const participantNeedingMailList = prediction.participants
    .filter((participant) => participant.accepted)
    .filter((participant) => participant.end_mail_sent === false)

  await Promise.all(
    participantNeedingMailList.map(async (participant) => {
      try {
        if (isMailValid(participant.mail)) {
          console.log(`sending end mail to ${participant.mail}`)
          await sendMail(participant.mail, getParticipantEndMail(prediction, participant))
        } else {
          console.log(`endmail skipping invalid mail: ${participant.mail}`)
        }
        await setParticipantEndMailSent(participant.hash)
      } catch (e) {
        console.error(`failed sending end mail to ${participant.mail}`)
        throw e
      }
    }),
  )
}
