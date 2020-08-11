import uuid from 'uuid/v4'

import { query, queryString, SQL } from '../util/db'
import { confirmAccountExistance, validateAccount } from './account'
import { handleUnsentAcceptEmail, handleUnsentCreaterAcceptEmail } from './scheduler'
import { censorMail } from '../util/mail-util'
import { QueryResult } from 'pg'

const ensureSingleGet = (cursor: QueryResult) => {
  if (cursor.rows.length !== 1) {
    throw new Error(`Cursor did not contain single row. Count: ${cursor.rows.length}`)
  } else {
    return cursor.rows[0]
  }
}

/**
 * Removes all private hashes from the predicition. Also censor the mails!
 * @param prediction
 * @param keepHashes These hashes will not be removed
 */
export const getCensoredPrediction = (
  prediction: Prediction,
  keepHashes: string[] = [],
): PredictionCensored => ({
  ...prediction,
  creater: {
    ...prediction.creater,
    hash: undefined,
    mail: censorMail(prediction.creater.mail),
  },
  participants: prediction.participants.map(participant => ({
    ...participant,
    hash: keepHashes.includes(participant.hash) ? participant.hash : undefined,
    mail: censorMail(participant.mail),
  })),
})

export const getLatestPredictions = () =>
  queryString(
    'SELECT title, body, hash from prediction where public is true ORDER BY created LIMIT 20',
  ).then(cursor => cursor.rows)

export const getPrediction = async (hash: string): Promise<Prediction> => {
  const prediction = await query(
    SQL`SELECT title, body, hash, finish_date FROM prediction WHERE hash = ${hash}`,
  ).then(cursor => ensureSingleGet(cursor))
  const creater: Creater = await query(
    SQL`SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM creater WHERE prediction_hash = ${hash}`,
  ).then(cursor => ensureSingleGet(cursor))
  const participants: Participant[] = await query(
    SQL`SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM participant WHERE prediction_hash = ${hash}`,
  ).then(cursor => cursor.rows)

  const result: Prediction = {
    ...prediction,
    creater,
    participants,
  }

  return result
}

export const getNextPrediction = (): Promise<Prediction[]> =>
  queryString(`
SELECT finish_date, prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date > now()
  AND creater.accepted = true
ORDER BY finish_date asc limit 1
`).then(cursor => cursor.rows)

export const getOldBetWithUnsentCreaterAcceptMails = () =>
  queryString(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE creater.accepted_mail_sent = false 
`).then(cursor => cursor.rows)

export const getOldBetWithUnsentAcceptMails = () =>
  queryString(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE participant.accepted_mail_sent = false
  AND creater.accepted = true
`).then(cursor => cursor.rows)

export const getOldBetWithUnsentEndMails = () =>
  queryString(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date < now() and participant.end_mail_sent = false
  AND creater.accepted = true
`).then(cursor => cursor.rows)

export const createPrediction = async (
  title: string,
  body: string,
  finishDate: string,
  isPublic: boolean,
  createrMail: string,
  participantList: string[],
) => {
  const hash = uuid()
  await query(
    SQL`INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(${title}, ${body}, ${hash}, ${finishDate}, ${isPublic})`,
  )
  await createCreater(hash, createrMail)
  const promises = participantList.map(participant => createParticipant(hash, participant))
  await Promise.all(promises)
  return handleUnsentCreaterAcceptEmail(hash)
}

export const createCreater = async (predictionHash: string, mail: string) => {
  const hash = uuid()
  await confirmAccountExistance(mail)
  return query(
    SQL`INSERT INTO creater (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`,
  )
}

export const createParticipant = async (predictionHash: string, mail: string) => {
  const hash = uuid()
  await confirmAccountExistance(mail)
  return query(
    SQL`INSERT INTO participant (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`,
  )
}

// TODO throw exceptions when stuff miss?
export const setCreaterAcceptMailSent = (hash: string) =>
  query(SQL`UPDATE creater SET accepted_mail_sent = true where hash = ${hash}`)

export const setParticipantAcceptMailSent = (hash: string) =>
  query(SQL`UPDATE participant SET accepted_mail_sent = true where hash = ${hash}`)

export const updateCreaterAcceptStatus = async (
  predictionHash: string,
  hash: string,
  accepted: boolean,
) => {
  await query(
    SQL`UPDATE creater SET accepted = ${accepted}, accepted_date = now() where prediction_hash = ${predictionHash} AND hash = ${hash}`,
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
    SQL`UPDATE participant SET accepted = ${accepted}, accepted_date = now() where prediction_hash = ${predictionHash} AND hash = ${hash}`,
  )
  const prediction = await getPrediction(predictionHash)
  const participant = prediction.participants.find(p => p.hash === hash)!
  return validateAccount(participant.mail)
}
