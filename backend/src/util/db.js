/* eslint-disable no-console */
import config from './config';

const Pool = require('pg').Pool;

const databaseConfig = config().database;

let dbPool;
const getDbPool = () => {
  if (dbPool == null) {
    console.log('creating pool');
    dbPool = new Pool(databaseConfig);
  }
  return dbPool;
};

// Use this for single query
export const query = (...args) => getDbPool().query(...args);

// Use this to gain a client for multiple operations, such as transactions
export const getClient = () =>
  new Promise((resolve, reject) => {
    getDbPool().connect((err, client) => {
      if (err) {
        reject(err);
      } else {
        resolve(client);
      }
    });
  });

// inspired by https://github.com/felixfbecker/node-sql-template-strings
export const SQL = (parts, ...values) =>
  ({
    text: parts.reduce((prev, curr, i) => prev + '$' + i + curr), // eslint-disable-line prefer-template
    values,
  });

