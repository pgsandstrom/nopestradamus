import uuid from 'uuid/v4';

import { query, SQL } from '../util/db';

// TODO add database constraints and indexes and stuff

export const validateAccountExistance = async (mail) => {
  const hash = uuid();
  const value = await query(`SELECT count(*) FROM mail WHERE mail = ${mail}`).then(cursor => cursor.rows[0]);
  if (value === 0) {
    await query(SQL`INSERT INTO mail (mail, hash) VALUES(${mail}, ${hash})`);
  }
};
