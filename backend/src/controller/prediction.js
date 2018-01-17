import uuid from 'uuid/v4';

import { query, SQL } from '../util/db';

export const getPredictions = () =>
  query('SELECT title, body, hash from prediction where public is true', []).then(cursor => cursor.rows);

export const getPrediction = async (hash) => {
  const prediction = await query(SQL`SELECT title, body, hash, finish_date from prediction where hash = ${hash}`).then(cursor => cursor.rows);
  const participants = await query(SQL`SELECT hash, mail, creator, accepted, accepted_mail_sent, end_mail_sent from participant where prediction_hash = ${hash}`).then(cursor => cursor.rows);

  return {
    ...prediction,
    participants,
  };
};

export const getNextPrediction = () => query('SELECT finish_date, hash FROM prediction WHERE prediction.finish_date > now() order by finish_date asc limit 1')
  .then(cursor => cursor.rows);

export const getOldBetWithUnsentAcceptMails = () => query('SELECT DISTINCT prediction.hash FROM prediction JOIN participant on prediction.hash = participant.prediction_hash WHERE prediction.finish_date < now() and accepted_mail_sent = false')
  .then(cursor => cursor.rows);

export const getOldBetWithUnsentEndMails = () => query('SELECT DISTINCT prediction.hash FROM prediction JOIN participant on prediction.hash = participant.prediction_hash WHERE prediction.finish_date < now() and end_mail_sent = false')
  .then(cursor => cursor.rows);

export const getPredictionMails = hash => query(`SELECT hash, mail FROM prediction JOIN participant on prediction.hash = participant.prediction_hash WHERE hash = ${hash}`)
  .then(cursor => cursor.rows);

export const createPrediction = async (title, body, finishDate, isPublic, creator, participantList) => {
  const hash = uuid();
  await query(SQL`INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(${title}, ${body}, ${hash}, ${finishDate}, ${isPublic})`);
  createParticipant(hash, creator, true);
  participantList.forEach(participant => createParticipant(hash, participant.mail, false));
};

export const createParticipant = (predictionHash, mail, creator) => {
  const hash = uuid();
  return query(SQL`INSERT INTO participant (hash, prediction_hash, mail, creator) VALUES (${hash}, ${predictionHash}, ${mail}, ${creator})`);
};
