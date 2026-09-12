import { randomUUID } from 'node:crypto'

import type {
  Creater,
  OrphanedRow,
  Participant,
  Prediction,
  PredictionAdmin,
  PredictionAdminListItem,
  PredictionCensored,
  PredictionHealth,
  PredictionRow,
  PredictionShallow,
} from '../shared/index.ts'
import { censorMail, isMailValid } from '../shared/mail-util.ts'
import {
  validateCreaterMail,
  validateDateString,
  validateDescription,
  validateParticipant,
  validateTitle,
} from '../shared/validate-prediction.ts'
import { query, querySingle, queryString, SQL, transaction } from '../util/db.ts'
import { adminGetAccounts, confirmAccountExistance, validateAccount } from './account.ts'
import { handleUnsentAcceptEmail, handleUnsentCreaterAcceptEmail } from './scheduler.ts'

/**
 * Removes all private hashes from the prediction. Also censors the mails!
 * @param currentUserHash the participant hash of the viewer, so we can flag their own row
 */
export const getCensoredPrediction = (
  prediction: Prediction,
  currentUserHash?: string,
): PredictionCensored => ({
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
})

export const getLatestPredictions = async (): Promise<PredictionShallow[]> => {
  const cursor = await queryString<PredictionShallow>(
    `SELECT title, body, prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE public IS true
AND creater.accepted IS true
ORDER BY created DESC
LIMIT 20`,
  )
  return cursor.rows
}

/**
 * Searches predictions by title, private ones included.
 */
export const adminGetPredictionsByTitle = async (title: string): Promise<PredictionShallow[]> => {
  const likeTitle = `%${title}%`
  const cursor = await query<PredictionShallow>(
    SQL`SELECT title, body, prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.title ILIKE ${likeTitle}
ORDER BY created DESC`,
  )
  return cursor.rows
}

export const getPrediction = async (hash: string): Promise<Prediction | undefined> => {
  const prediction = await querySingle<Omit<Prediction, 'creater' | 'participants'>>(
    SQL`SELECT created, title, body, hash, finish_date FROM prediction WHERE hash = ${hash}`,
  )
  if (prediction === undefined) {
    return undefined
  }

  const [creater, participants] = await Promise.all([
    querySingle<Creater>(
      SQL`SELECT hash, mail, accepted, accepted_date, accepted_mail_sent, end_mail_sent FROM creater WHERE prediction_hash = ${hash}`,
    ),
    query<Participant>(
      SQL`SELECT hash, mail, accepted, accepted_date, accepted_mail_sent, end_mail_sent FROM participant WHERE prediction_hash = ${hash}`,
    ),
  ])
  if (creater === undefined) {
    throw new Error(`Prediction ${hash} has no creater`)
  }

  return { ...prediction, creater, participants: participants.rows }
}

const selectPredictionHashes = async (text: string): Promise<string[]> => {
  const cursor = await queryString<{ hash: string }>(text)
  return cursor.rows.map((row) => row.hash)
}

export const getOldBetWithUnsentCreaterAcceptMails = (): Promise<string[]> =>
  selectPredictionHashes(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE creater.accepted_mail_sent = false
`)

/** Newest first, like the admin list. DISTINCT is why `created` has to be selected as well. */
export const getCreaterNotAcceptedPredictions = (): Promise<string[]> =>
  selectPredictionHashes(`
SELECT DISTINCT prediction.hash, prediction.created FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE creater.accepted IS NOT true
ORDER BY prediction.created DESC
`)

export const getOldBetWithUnsentCreaterEndMails = (): Promise<string[]> =>
  selectPredictionHashes(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date < now()
  AND creater.accepted = true
  AND creater.end_mail_sent = false
`)

export const getOldBetWithUnsentParticipantsAcceptMails = (): Promise<string[]> =>
  selectPredictionHashes(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE participant.accepted_mail_sent = false
  AND creater.accepted = true
`)

export const getOldBetWithUnsentParticipantsEndMails = (): Promise<string[]> =>
  selectPredictionHashes(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date < now()
  AND participant.accepted = true
  AND participant.end_mail_sent = false
  AND creater.accepted = true
`)

export interface CreatePredictionInput {
  title?: string
  body?: string
  finishDate?: string
  isPublic?: boolean
  createrMail?: string
  participantList?: string[]
}

export const createPrediction = async (input: CreatePredictionInput): Promise<void> => {
  const { title, body, finishDate, isPublic } = input
  const createrMail = input.createrMail?.trim()
  const participantList = input.participantList?.map((p) => p.trim())

  if (!validateTitle(title)) {
    throw new Error('Invalid title')
  }
  if (!validateDescription(body)) {
    throw new Error('Invalid description')
  }
  if (!validateDateString(finishDate)) {
    throw new Error('Invalid finishDate')
  }
  if (isPublic === undefined) {
    throw new Error('Invalid isPublic')
  }
  if (!validateCreaterMail(createrMail)) {
    throw new Error('Invalid createrMail')
  }
  if (
    participantList === undefined ||
    !participantList.every((p) => validateParticipant(p, participantList))
  ) {
    throw new Error('Invalid participantList')
  }

  const hash = randomUUID()
  await query(
    SQL`INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(${title}, ${body}, ${hash}, ${finishDate}, ${isPublic})`,
  )
  await createCreater(hash, createrMail)
  await Promise.all(participantList.map((participant) => createParticipant(hash, participant)))
  await handleUnsentCreaterAcceptEmail(hash)
}

const createCreater = async (predictionHash: string, mail: string): Promise<void> => {
  if (!isMailValid(mail)) {
    throw new Error(`creater mail is invalid: ${mail}`)
  }
  await confirmAccountExistance(mail)
  await query(
    SQL`INSERT INTO creater (hash, prediction_hash, mail) VALUES (${randomUUID()}, ${predictionHash}, ${mail})`,
  )
}

const createParticipant = async (predictionHash: string, mail: string): Promise<void> => {
  if (!isMailValid(mail)) {
    throw new Error(`participant mail is invalid: ${mail}`)
  }
  await confirmAccountExistance(mail)
  await query(
    SQL`INSERT INTO participant (hash, prediction_hash, mail) VALUES (${randomUUID()}, ${predictionHash}, ${mail})`,
  )
}

export const deletePrediction = async (hash: string) =>
  // One transaction, so a failure part way through cannot leave orphaned creater/participant rows.
  transaction(async (tx) => {
    const prediction = await tx(SQL`DELETE FROM prediction WHERE hash = ${hash}`)
    const creater = await tx(SQL`DELETE FROM creater WHERE prediction_hash = ${hash}`)
    const participant = await tx(SQL`DELETE FROM participant WHERE prediction_hash = ${hash}`)

    return {
      predictionDeleted: prediction.rowCount,
      createrDeleted: creater.rowCount,
      participantDeleted: participant.rowCount,
    }
  })

export const setCreaterAcceptMailSent = async (hash: string): Promise<void> => {
  const result = await query(SQL`UPDATE creater SET accepted_mail_sent = true WHERE hash = ${hash}`)
  if (result.rowCount !== 1) {
    throw new Error('failed to set creater accepted_mail_sent')
  }
}

export const setCreaterEndMailSent = async (hash: string): Promise<void> => {
  const result = await query(SQL`UPDATE creater SET end_mail_sent = true WHERE hash = ${hash}`)
  if (result.rowCount !== 1) {
    throw new Error('failed to set creater end_mail_sent')
  }
}

export const setParticipantAcceptMailSent = async (hash: string): Promise<void> => {
  await query(SQL`UPDATE participant SET accepted_mail_sent = true WHERE hash = ${hash}`)
}

export const setParticipantEndMailSent = async (hash: string): Promise<void> => {
  await query(SQL`UPDATE participant SET end_mail_sent = true WHERE hash = ${hash}`)
}

export const updateCreaterAcceptStatus = async (
  predictionHash: string,
  hash: string,
  accepted: boolean,
): Promise<void> => {
  const result = await query(
    SQL`UPDATE creater SET accepted = ${accepted}, accepted_date = now() WHERE prediction_hash = ${predictionHash} AND hash = ${hash}`,
  )
  if (result.rowCount === 0) {
    throw new Error(`Failed to update with prediction ${predictionHash} and hash ${hash}`)
  }
  const prediction = await getPrediction(predictionHash)
  if (prediction === undefined) {
    throw new Error(`Prediction not found: ${predictionHash}`)
  }
  await validateAccount(prediction.creater.mail)
  await handleUnsentAcceptEmail(predictionHash)
}

export const updateParticipantAcceptStatus = async (
  predictionHash: string,
  hash: string,
  accepted: boolean,
): Promise<void> => {
  const result = await query(
    SQL`UPDATE participant SET accepted = ${accepted}, accepted_date = now() WHERE prediction_hash = ${predictionHash} AND hash = ${hash}`,
  )
  if (result.rowCount === 0) {
    throw new Error(`Failed to update with prediction ${predictionHash} and hash ${hash}`)
  }
  const prediction = await getPrediction(predictionHash)
  if (prediction === undefined) {
    throw new Error(`Prediction not found: ${predictionHash}`)
  }
  const participant = prediction.participants.find((p) => p.hash === hash)
  if (participant === undefined) {
    throw new Error(`Participant not found: ${hash}`)
  }
  await validateAccount(participant.mail)
}

/**
 * Every prediction, newest first, with its creater and a tally of its participants.
 * Both joins are LEFT joins, so a prediction with a missing creater row still shows up —
 * the admin list is the one place such a broken row has to be visible.
 */
export const adminGetAllPredictions = async (): Promise<PredictionAdminListItem[]> => {
  const cursor = await queryString<PredictionAdminListItem>(
    `SELECT prediction.created, prediction.title, prediction.hash, prediction.finish_date, prediction.public,
  creater.mail AS creater_mail,
  creater.accepted AS creater_accepted,
  creater.accepted_mail_sent AS creater_accept_mail_sent,
  creater.end_mail_sent AS creater_end_mail_sent,
  COALESCE(stats.participant_count, 0) AS participant_count,
  COALESCE(stats.participant_accepted_count, 0) AS participant_accepted_count,
  COALESCE(stats.participant_rejected_count, 0) AS participant_rejected_count
FROM prediction
LEFT JOIN creater ON prediction.hash = creater.prediction_hash
LEFT JOIN (
  SELECT prediction_hash,
    count(*) AS participant_count,
    count(*) FILTER (WHERE accepted IS true) AS participant_accepted_count,
    count(*) FILTER (WHERE accepted IS false) AS participant_rejected_count
  FROM participant
  GROUP BY prediction_hash
) stats ON prediction.hash = stats.prediction_hash
ORDER BY prediction.created DESC`,
  )
  return cursor.rows
}

/**
 * Everything stored about one prediction: every column, every creater/participant row and the
 * mail account behind each address. Unlike getPrediction this tolerates a missing creater.
 */
export const adminGetPrediction = async (hash: string): Promise<PredictionAdmin | undefined> => {
  const prediction = await querySingle<PredictionRow>(
    SQL`SELECT created, title, body, hash, finish_date, public, creator_validated FROM prediction WHERE hash = ${hash}`,
  )
  if (prediction === undefined) {
    return undefined
  }

  const [createrResult, participantResult] = await Promise.all([
    query<Creater>(
      SQL`SELECT hash, mail, accepted, accepted_date, accepted_mail_sent, end_mail_sent FROM creater WHERE prediction_hash = ${hash}`,
    ),
    query<Participant>(
      SQL`SELECT hash, mail, accepted, accepted_date, accepted_mail_sent, end_mail_sent FROM participant WHERE prediction_hash = ${hash} ORDER BY mail`,
    ),
  ])
  const creater = createrResult.rows[0]
  const participants = participantResult.rows

  const mails = [creater?.mail, ...participants.map((participant) => participant.mail)].filter(
    (mail) => mail !== undefined,
  )
  const accounts = await adminGetAccounts([...new Set(mails)])

  return { prediction, creater, participants, accounts }
}

/**
 * Creater and participant rows whose prediction is gone, which is what a delete that fails
 * part way through leaves behind. Nothing else in the app can see them.
 */
export const adminGetOrphanedRows = async (): Promise<OrphanedRow[]> => {
  const cursor = await queryString<OrphanedRow>(
    `SELECT 'creater' AS role, hash, prediction_hash, mail FROM creater
WHERE NOT EXISTS (SELECT 1 FROM prediction WHERE prediction.hash = creater.prediction_hash)
UNION ALL
SELECT 'participant' AS role, hash, prediction_hash, mail FROM participant
WHERE NOT EXISTS (SELECT 1 FROM prediction WHERE prediction.hash = participant.prediction_hash)
ORDER BY prediction_hash, role, mail`,
  )
  return cursor.rows
}

/**
 * One row of counts for the monthly health mail. An aggregate always returns a row, so an empty
 * database reports zeroes rather than nothing. The LEFT JOIN keeps predictions whose creater row
 * is gone, which is what a half finished delete leaves behind.
 */
export const getPredictionHealth = async (): Promise<PredictionHealth> => {
  const row = await querySingle<PredictionHealth>(
    SQL`SELECT
  count(DISTINCT prediction.hash) AS total,
  count(DISTINCT prediction.hash) FILTER (WHERE creater.accepted IS NOT true) AS awaiting_creater,
  count(DISTINCT prediction.hash) FILTER (
    WHERE creater.accepted = true AND prediction.finish_date > now()
  ) AS running,
  count(DISTINCT prediction.hash) FILTER (
    WHERE creater.accepted = true AND prediction.finish_date <= now()
  ) AS finished,
  min(prediction.finish_date) FILTER (
    WHERE creater.accepted = true AND prediction.finish_date > now()
  ) AS next_finish_date
FROM prediction
LEFT JOIN creater ON prediction.hash = creater.prediction_hash`,
  )
  if (row === undefined) {
    throw new Error('health query returned no row')
  }
  return row
}
