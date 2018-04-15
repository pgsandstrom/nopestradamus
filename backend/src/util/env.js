var PROD_ENV = 'PROD_ENV';
export var NODE_ENV_PRODUCTION = 'production';
export var NODE_ENV_DEV = 'development';
export var isDev = function () { return isProdServer() === false && isTestServer() === false; };
var isProduction = function () {
    if (process.env.NODE_ENV !== NODE_ENV_PRODUCTION && process.env.NODE_ENV !== NODE_ENV_DEV) {
        throw new Error("invalid NODE_ENV: " + process.env.NODE_ENV);
    }
    return process.env.NODE_ENV === 'production';
};
export var isProdServer = function () { return isProduction() && isEnvVariableTrue(PROD_ENV); };
export var isTestServer = function () { return isProduction() && isProdServer() === false; };
var isEnvVariableTrue = function (envVariable) { return process.env[envVariable] != null && process.env[envVariable].toLowerCase() === 'true'; };
//# sourceMappingURL=env.js.map