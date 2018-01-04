import uuid from 'uuid/v4';

import { query, SQL } from '../util/db';

export const getPredictions = () =>
  query('SELECT title, body, hash from prediction where public is true', []).then(cursor => cursor.rows);

export const getPrediction = hash =>
  query('SELECT title, body, hash from prediction where hash = $1', [hash]).then(cursor => cursor.rows);

export const createPrediction = (title, body, isPublic, participantList) => {
  const hash = uuid();
  query(SQL`INSERT INTO predictions (title, body, hash, public) VALUES(${title}, ${body}, ${hash}, ${isPublic})`);
};
