import uuid from 'uuid/v4';

import { query, SQL } from '../util/db';
import { confirmAccountExistance, validateAccount } from './account';
import { handleUnsentAcceptEmail, handleUnsentCreaterAcceptEmail } from './scheduler';
import { censorMail } from '../util/mail-util';

const ensureSingleGet = (cursor) => {
  if (cursor.rows.length !== 1) {
    throw new Error(`Cursor did not contain single row. Count: ${cursor.rows.length}`);
  } else {
    return cursor.rows[0];
  }
};

/**
 * Removes all private hashes from the predicition. Also censor the mails!
 * @param prediction
 * @param keepHashes These hashes will not be removed
 */
export const getCensoredPrediction = (prediction, keepHashes = []) => ({
  ...prediction,
  creater: {
    ...prediction.creater,
    hash: undefined,
    mail: censorMail(prediction.creater.mail),
  },
  participants: prediction.participants.map(participant => (
    {
      ...participant,
      hash: keepHashes.includes(participant.hash) ? participant.hash : null,
      mail: censorMail(participant.mail),
    }
  )),
});

export const getLatestPredictions = () =>
  query('SELECT title, body, hash from prediction where public is true ORDER BY created LIMIT 20').then(cursor => cursor.rows);

export const getPrediction = async (hash) => {
  const prediction = await query(SQL`SELECT title, body, hash, finish_date FROM prediction WHERE hash = ${hash}`).then(cursor => ensureSingleGet(cursor));
  const creater = await query(SQL`SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM creater WHERE prediction_hash = ${hash}`).then(cursor => ensureSingleGet(cursor));
  const participants = await query(SQL`SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM participant WHERE prediction_hash = ${hash}`).then(cursor => cursor.rows);

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
  await Promise.all(promises);
  return handleUnsentCreaterAcceptEmail(hash);
};

export const createCreater = async (predictionHash, mail) => {
  const hash = uuid();
  await confirmAccountExistance(mail);
  return query(SQL`INSERT INTO creater (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`);
};

export const createParticipant = async (predictionHash, mail) => {
  const hash = uuid();
  await confirmAccountExistance(mail);
  return query(SQL`INSERT INTO participant (hash, prediction_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`);
};

// TODO throw exceptions when stuff miss?
export const setCreaterAcceptMailSent = hash => query(SQL`UPDATE creater SET accepted_mail_sent = true where hash = ${hash}`);

export const setParticipantAcceptMailSent = hash => query(SQL`UPDATE participant SET accepted_mail_sent = true where hash = ${hash}`);

export const updateCreaterAcceptStatus = async (predictionHash, hash, accepted) => {
  await query(SQL`UPDATE creater SET accepted = ${accepted}, accepted_date = now() where prediction_hash = ${predictionHash} AND hash = ${hash}`);
  const prediction = await getPrediction(predictionHash);
  await validateAccount(prediction.creater.mail);
  return handleUnsentAcceptEmail(predictionHash);
};

export const updateParticipantAcceptStatus = async (predictionHash, hash, accepted) => {
  await query(SQL`UPDATE participant SET accepted = ${accepted}, accepted_date = now() where prediction_hash = ${predictionHash} AND hash = ${hash}`);
  const prediction = await getPrediction(predictionHash);
  const participant = prediction.participants.find(p => p.hash === hash);
  return validateAccount(participant.mail);
};
