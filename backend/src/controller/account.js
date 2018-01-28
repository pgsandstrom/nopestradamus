import uuid from 'uuid/v4';

import { query, SQL } from '../util/db';

// TODO add database constraints and indexes and stuff

export const confirmAccountExistance = async (mail, validated = false) => {
  const hash = uuid();
  const result = await query(SQL`SELECT count(*) FROM mail WHERE mail = ${mail}`).then(cursor => cursor.rows[0]);
  if (result.count === '0') {
    await query(SQL`INSERT INTO mail (mail, hash, validated) VALUES(${mail}, ${hash}, ${validated})`);
  }
};

export const validateAccount = mail => confirmAccountExistance(mail, true);