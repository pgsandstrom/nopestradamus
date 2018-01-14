import uuid from 'uuid/v4';

import { query, SQL } from '../util/db';

export const getPredictions = () =>
  query('SELECT title, body, hash from prediction where public is true', []).then(cursor => cursor.rows);

export const getPrediction = hash =>
  query('SELECT title, body, hash from prediction where hash = $1', [hash]).then(cursor => cursor.rows);

export const getNextPrediction = () => query('SELECT finish_date FROM prediction WHERE prediction.finish_date > now() order by finish_date asc limit 1')
  .then(cursor => cursor.rows);

export const getOldUnsentAcceptMails = () => query('SELECT mail FROM prediction JOIN participant on prediction.hash = participant.predicition_hash WHERE prediction.finish_date < now() and end_mail_sent = false')
  .then(cursor => cursor.rows);

export const getOldUnsentEndMails = () => query('SELECT mail FROM prediction JOIN participant on prediction.hash = participant.predicition_hash WHERE prediction.finish_date < now() and end_mail_sent = false')
  .then(cursor => cursor.rows);

export const createPrediction = async (title, body, finishDate, isPublic, participantList) => {
  const hash = uuid();
  await query(SQL`INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(${title}, ${body}, ${hash}, ${finishDate}, ${isPublic})`);
  participantList.forEach(participant => createParticipant(hash, participant.mail));
};

export const createParticipant = (predictionHash, mail) => {
  const hash = uuid();
  return query(SQL`INSERT INTO participant (hash, predicition_hash, mail) VALUES (${hash}, ${predictionHash}, ${mail})`);
};
