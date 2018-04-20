import { Pool } from 'pg';
import config from './config';
var databaseConfig = config().database;
var dbPool;
var getDbPool = function () {
    if (dbPool == null) {
        console.log('creating pool');
        dbPool = new Pool(databaseConfig);
    }
    return dbPool;
};
export var query = function (stuff) { return getDbPool().query(stuff); };
export var queryString = function (stuff) { return getDbPool().query(stuff); };
export var getClient = function () {
    return new Promise(function (resolve, reject) {
        getDbPool().connect(function (err, client) {
            if (err) {
                reject(err);
            }
            else {
                resolve(client);
            }
        });
    });
};
export var SQL = function (parts) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return ({
        text: parts.reduce(function (prev, curr, i) { return prev + '$' + i + curr; }),
        values: values
    });
};
//# sourceMappingURL=db.js.map