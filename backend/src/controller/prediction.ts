import { v4 as uuidv4 } from 'uuid'

import { query, queryString, SQL, querySingle } from '../util/db'
import { confirmAccountExistance, validateAccount } from './account'
import { handleUnsentAcceptEmail, handleUnsentCreaterAcceptEmail } from './scheduler'
import { PredictionCensored, PredictionShallow } from '../../../frontend/shared'
import { censorMail, isMailValid } from '../../../frontend/shared/mail-util'
import { NotFoundError } from 'restify-errors'
import {
  validateTitle,
  validateParticipant,
  validateDescription,
  validateCreaterMail,
  validateDateString,
} from '../../../frontend/shared/validatePrediction'

/**
 * Removes all private hashes from the predicition. Also censors the mails!
 * @param prediction
 * @param keepHashes These hashes will not be removed
 */
export const getCensoredPrediction = (
  prediction: Prediction,
  currentUserHash?: string,
): PredictionCensored => {
  return {
    ...prediction,
    creater: {
      ...prediction.creater,
      hash: undefined,
      mail: censorMail(prediction.creater.mail),
    },
    participants: prediction.participants.map((participant) => ({
      ...participant,
      hash: undefined,
      isCurrentUser: currentUserHash === participant.hash,
      mail: censorMail(participant.mail),
    })),
  }
}

export const getLatestPredictions = () =>
  queryString(
    `SELECT title, body, prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE public IS true
AND creater.accepted IS true
ORDER BY created DESC
LIMIT 20`,
  ).then((cursor) => cursor.rows as PredictionShallow[])

export const getPredictions = (title: string) => {
  const likeTitle = `%${title}%`
  return query(SQL`SELECT title, body, prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE public IS true
AND prediction.title LIKE ${likeTitle}
ORDER BY created DESC`).then((cursor) => cursor.rows as PredictionShallow[])
}

export const getPrediction = async (hash: string): Promise<Prediction> => {
  // TODO serialize this
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const prediction = await querySingle(
    SQL`SELECT created, title, body, hash, finish_date FROM prediction WHERE hash = ${hash}`,
  )

  if (prediction === undefined) {
    throw new NotFoundError(`Prediction ${hash} not found`)
  }

  const creater = await querySingle(
    SQL`SELECT hash, mail, accepted, accepted_date, accepted_mail_sent, end_mail_sent FROM creater WHERE prediction_hash = ${hash}`,
  )
  const participants: Participant[] = (
    await query(
      SQL`SELECT hash, mail, accepted, accepted_date, accepted_mail_sent, end_mail_sent FROM participant WHERE prediction_hash = ${hash}`,
    )
  ).rows

  const result: Prediction = {
    ...prediction,
    creater,
    participants,
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

  return result
}

export const getOldBetWithUnsentCreaterAcceptMails = async () => {
  const cursor = await queryString<{ hash: string }>(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE creater.accepted_mail_sent = false 
`)
  return cursor.rows.map((row) => row.hash)
}

export const getOldBetWithUnsentCreaterEndMails = async () => {
  const cursor = await queryString<{ hash: string }>(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date < now()
  AND creater.accepted = true
  AND creater.end_mail_sent = false 
`)
  return cursor.rows.map((row) => row.hash)
}

export const getOldBetWithUnsentParticipantsAcceptMails = async () => {
  const cursor = await queryString<{ hash: string }>(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE participant.accepted_mail_sent = false
  AND creater.accepted = true
`)
  return cursor.rows.map((row) => row.hash)
}

export const getOldBetWithUnsentParticipantsEndMails = async () => {
  const cursor = await queryString<{ hash: string }>(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date < now()
  AND participant.accepted = true
  AND participant.end_mail_sent = false
  AND creater.accepted = true
`)
  return cursor.rows.map((row) => row.hash)
}

export const createPrediction = async (
  title?: string,
  body?: string,
  finishDate?: string,
  isPublic?: boolean,
  createrMailRaw?: string,
  participantListRaw?: string[],
) => {
  const createrMail = createrMailRaw?.trim()
  const participantList = participantListRaw?.map((p) => p.trim())

  if (!validateTitle(title)) {
    throw new Error('Invalid title')
  }
  if (!validateDescription(body)) {
    throw new Error('title must be present')
  }
  if (!validateDateString(finishDate)) {
    throw new Error('finishDate must be present')
  }
  if (isPublic === undefined) {
    throw new Error('Invalid isPublic')
  }
  if (!validateCreaterMail(createrMail)) {
    throw new Error('createrMail must be present')
  }
  if (
    participantList === undefined ||
    !participantList.every((p) => validateParticipant(p, participantList))
  ) {
    throw new Error('participantList invalid')
  }

  const hash = uuidv4()
  await query(
    SQL`INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(${title}, ${body}, ${hash}, ${finishDate}, ${isPublic})`,
  )
  await createCreater(hash, createrMail)
  const promiseList = participantList.map((participant) => createParticipant(hash, participant))
  await Promise.all(promiseList)
  return handleUnsentCreaterAcceptEmail(hash)
}

const createCreater = async (predictionHash: string, mail: string) => {
  if (!isMailValid(mail)) {
    throw new Error(`creater mail is invalid:${mail}`)
  }
  const hash = uuidv4()
  await confirmAccountExistance(mail)
  return query(
    SQL`INSERT INTO creater (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`,
  )
}

const createParticipant = async (predictionHash: string, mail: string) => {
  if (!isMailValid(mail)) {
    throw new Error(`participant mail is invalid:${mail}`)
  }
  const hash = uuidv4()
  await confirmAccountExistance(mail)
  return query(
    SQL`INSERT INTO participant (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`,
  )
}

export const deletePrediction = async (hash: string) => {
  const predictionPromise = await query(SQL`DELETE FROM prediction WHERE hash = ${hash}`)
  const createrPromise = await query(SQL`DELETE FROM creater WHERE prediction_hash = ${hash}`)
  const participantPromise = await query(
    SQL`DELETE FROM participant WHERE prediction_hash = ${hash}`,
  )

  return {
    predictionDeleted: predictionPromise.rowCount,
    createrDeleted: createrPromise.rowCount,
    participantDeleted: participantPromise.rowCount,
  }
}

// TODO throw exceptions when stuff miss?
export const setCreaterAcceptMailSent = async (hash: string) => {
  const result = await query(SQL`UPDATE creater SET accepted_mail_sent = true WHERE hash = ${hash}`)
  if (result.rowCount !== 1) {
    throw new Error('failed to set creater accepted_mail_sent')
  }
  return result
}

export const setCreaterEndMailSent = async (hash: string) => {
  const result = await query(SQL`UPDATE creater SET end_mail_sent = true WHERE hash = ${hash}`)
  if (result.rowCount !== 1) {
    throw new Error('failed to set creater end_mail_sent')
  }
  return result
}

export const setParticipantAcceptMailSent = (hash: string) =>
  query(SQL`UPDATE participant SET accepted_mail_sent = true WHERE hash = ${hash}`)

export const setParticipantEndMailSent = (participantHash: string) =>
  query(SQL`UPDATE participant SET end_mail_sent = true WHERE hash = ${participantHash}`)

export const updateCreaterAcceptStatus = async (
  predictionHash: string,
  hash: string,
  accepted: boolean,
) => {
  await query(
    SQL`UPDATE creater SET accepted = ${accepted}, accepted_date = now() WHERE prediction_hash = ${predictionHash} AND hash = ${hash}`,
  )
  const prediction = await getPrediction(predictionHash)
  await validateAccount(prediction.creater.mail)
  return handleUnsentAcceptEmail(predictionHash)
}

export const updateParticipantAcceptStatus = async (
  predictionHash: string,
  hash: string,
  accepted: boolean,
) => {
  await query(
    SQL`UPDATE participant SET accepted = ${accepted}, accepted_date = now() WHERE prediction_hash = ${predictionHash} AND hash = ${hash}`,
  )
  const prediction = await getPrediction(predictionHash)
  const participant = prediction.participants.find((p) => p.hash === hash)!
  return validateAccount(participant.mail)
}
