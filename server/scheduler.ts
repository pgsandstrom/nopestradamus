import { formatDateTime } from '../shared/date-util.ts'
import { isMailValid } from '../shared/mail-util.ts'
import { getConfig } from '../util/config.ts'
import { confirmAccountExistance } from './account.ts'
import {
  getCreaterAcceptMail,
  getCreaterEndMail,
  getHealthMail,
  getParticipantAcceptMail,
  getParticipantEndMail,
} from './mail/templates.ts'
import { sendMail } from './mailer.ts'
import {
  getOldPredictionWithUnsentCreaterAcceptMails,
  getOldPredictionWithUnsentCreaterEndMails,
  getOldPredictionWithUnsentParticipantsAcceptMails,
  getOldPredictionWithUnsentParticipantsEndMails,
  getPrediction,
  getPredictionHealth,
  setCreaterAcceptMailSent,
  setCreaterEndMailSent,
  setParticipantAcceptMailSent,
  setParticipantEndMailSent,
} from './prediction.ts'

export const handleAllUnsentMails = async (): Promise<void> => {
  console.log('handle all unsent mails', formatDateTime(new Date()))
  await handleAll(getOldPredictionWithUnsentCreaterAcceptMails, handleUnsentCreaterAcceptEmail)
  await handleAll(getOldPredictionWithUnsentParticipantsAcceptMails, handleUnsentAcceptEmail)
  await handleAll(getOldPredictionWithUnsentCreaterEndMails, handleUnsentCreaterEndEmail)
  await handleAll(getOldPredictionWithUnsentParticipantsEndMails, handleUnsentEndEmail)
  console.log('completed handle all unsent mails')
}

/**
 * Proof that mail still works, sent monthly so a broken mail path is noticed before a prediction
 * comes due rather than at the moment it matters.
 * The account row is ensured first because sendMail looks the address up and throws when it has never been seen.
 */
export const sendHealthMail = async (): Promise<void> => {
  const receiver = getConfig().healthMailReceiver
  if (receiver === undefined) {
    console.log('no healthMailReceiver in config.json, skipping health mail')
    return
  }
  const [health, predictionsWithUnsentMail] = await Promise.all([
    getPredictionHealth(),
    countPredictionsWithUnsentMail(),
  ])
  await confirmAccountExistance(receiver)
  console.log(`sending health mail to ${receiver}`)
  await sendMail(receiver, getHealthMail(health, predictionsWithUnsentMail), {
    overrideBlock: true,
  })
}

/**
 * Reuses the same queries the hourly job acts on, so the reported number is exactly the backlog
 * that job would work through. A prediction can appear in several of them, hence the Set.
 */
const countPredictionsWithUnsentMail = async (): Promise<number> => {
  const hashLists = await Promise.all([
    getOldPredictionWithUnsentCreaterAcceptMails(),
    getOldPredictionWithUnsentParticipantsAcceptMails(),
    getOldPredictionWithUnsentCreaterEndMails(),
    getOldPredictionWithUnsentParticipantsEndMails(),
  ])
  return new Set(hashLists.flat()).size
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

  await Promise.all(
    participantNeedingMailList.map(async (participant) => {
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
    }),
  )
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
