var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { InternalServerError, makeConstructor } from 'restify-errors';
makeConstructor('GenericError', {
    statusCode: 500
});
export var getError = function (data) {
    if (data.stack) {
        console.log(data.stack);
    }
    var info;
    if (typeof data === 'string' || data instanceof String) {
        info = getBodyFromString(data);
    }
    else if (data != null && data instanceof Object) {
        info = getBodyFromObject(data);
    }
    var error = new InternalServerError({
        message: info.message,
        context: info
    });
    error.statusCode = info.statusCode || 500;
    return error;
};
var getBodyFromString = function (string) { return ({
    message: string,
    code: 0,
    error: true
}); };
var getBodyFromObject = function (object) { return ({
    message: object.message,
    code: object.code || 0,
    error: true,
    statusCode: object.statusCode,
    extraInfo: __assign({}, object, { message: undefined, code: undefined, statusCode: undefined, error: undefined })
}); };
//# sourceMappingURL=genericError.js.map