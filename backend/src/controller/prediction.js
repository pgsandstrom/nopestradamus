import uuid from 'uuid/v4';

import { query, SQL } from '../util/db';
import { ensureWaitingForBet } from './scheduler';
import { validateAccountExistance } from './account';

const ensureSingleGet = (cursor) => {
  if (cursor.rows.length !== 1) {
    throw new Error(`Cursor did not contain single row. Count: ${cursor.rows.length}`);
  } else {
    return cursor.rows[0];
  }
};

export const getCensoredPrediction = prediction => ({
  ...prediction,
  creater: {
    ...prediction.creater,
    hash: undefined,
  },
  participants: prediction.participants.map(participant => ({ ...participant, hash: undefined })),
});

export const getLatestPredictions = () =>
  query('SELECT title, body, hash from prediction where public is true ORDER BY created LIMIT 20').then(cursor => cursor.rows);

export const getPrediction = async (hash) => {
  const prediction = await query(SQL`SELECT title, body, hash, finish_date from prediction where hash = ${hash}`).then(cursor => ensureSingleGet(cursor));
  const creater = await query(SQL`SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent from creater where prediction_hash = ${hash}`).then(cursor => ensureSingleGet(cursor));
  const participants = await query(SQL`SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent from participant where prediction_hash = ${hash}`).then(cursor => cursor.rows);

  return {
    ...prediction,
    creater,
    participants,
  };
};

export const getNextPrediction = () => query(`
SELECT finish_date, prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date > now()
  AND creater.accepted = true
ORDER BY finish_date asc limit 1
`).then(cursor => cursor.rows);

export const getOldBetWithUnsentCreaterAcceptMails = () => query(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN creater on prediction.hash = creater.prediction_hash
WHERE creater.accepted_mail_sent = false 
`).then(cursor => cursor.rows);

export const getOldBetWithUnsentAcceptMails = () => query(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE participant.accepted_mail_sent = false
  AND creater.accepted = true
`).then(cursor => cursor.rows);

export const getOldBetWithUnsentEndMails = () => query(`
SELECT DISTINCT prediction.hash FROM prediction
JOIN participant on prediction.hash = participant.prediction_hash
JOIN creater on prediction.hash = creater.prediction_hash
WHERE prediction.finish_date < now() and participant.end_mail_sent = false
  AND creater.accepted = true
`).then(cursor => cursor.rows);

export const createPrediction = async (title, body, finishDate, isPublic, creater, participantList) => {
  const hash = uuid();
  await query(SQL`INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(${title}, ${body}, ${hash}, ${finishDate}, ${isPublic})`);
  await createCreater(hash, creater);
  const promises = participantList.map(participant => createParticipant(hash, participant));
  return Promise.all(promises);
};

export const createCreater = async (predictionHash, mail) => {
  const hash = uuid();
  await validateAccountExistance();
  return query(SQL`INSERT INTO creater (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`);
};

export const createParticipant = async (predictionHash, mail) => {
  const hash = uuid();
  await validateAccountExistance();
  return query(SQL`INSERT INTO participant (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`);
};

// TODO throw exceptions when stuff miss
export const updateCreaterAcceptStatus = async (predictionHash, hash, accepted) => {
  await query(SQL`UPDATE creater SET accepted = ${accepted}, accepted_date = now() where prediction_hash = ${predictionHash} AND hash = ${hash}`);
  ensureWaitingForBet();
};

export const updateParticipantAcceptStatus = (predictionHash, hash, accepted) => query(SQL`UPDATE participant SET accepted = ${accepted}, accepted_date = now() where prediction_hash = ${predictionHash} AND hash = ${hash}`);
