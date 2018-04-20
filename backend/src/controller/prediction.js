var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
import * as uuid from 'uuid/v4';
import { query, queryString, SQL } from '../util/db';
import { confirmAccountExistance, validateAccount } from './account';
import { handleUnsentAcceptEmail, handleUnsentCreaterAcceptEmail } from './scheduler';
import { censorMail } from '../util/mail-util';
var ensureSingleGet = function (cursor) {
    if (cursor.rows.length !== 1) {
        throw new Error("Cursor did not contain single row. Count: " + cursor.rows.length);
    }
    else {
        return cursor.rows[0];
    }
};
export var getCensoredPrediction = function (prediction, keepHashes) {
    if (keepHashes === void 0) { keepHashes = []; }
    return (__assign({}, prediction, { creater: __assign({}, prediction.creater, { hash: undefined, mail: censorMail(prediction.creater.mail) }), participants: prediction.participants.map(function (participant) { return (__assign({}, participant, { hash: keepHashes.includes(participant.hash) ? participant.hash : null, mail: censorMail(participant.mail) })); }) }));
};
export var getLatestPredictions = function () {
    return queryString('SELECT title, body, hash from prediction where public is true ORDER BY created LIMIT 20').then(function (cursor) { return cursor.rows; });
};
export var getPrediction = function (hash) { return __awaiter(_this, void 0, void 0, function () {
    var prediction, creater, participants, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, query(SQL(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT title, body, hash, finish_date FROM prediction WHERE hash = ", ""], ["SELECT title, body, hash, finish_date FROM prediction WHERE hash = ", ""])), hash)).then(function (cursor) { return ensureSingleGet(cursor); })];
            case 1:
                prediction = _a.sent();
                return [4, query(SQL(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM creater WHERE prediction_hash = ", ""], ["SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM creater WHERE prediction_hash = ", ""])), hash)).then(function (cursor) { return ensureSingleGet(cursor); })];
            case 2:
                creater = _a.sent();
                return [4, query(SQL(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM participant WHERE prediction_hash = ", ""], ["SELECT hash, mail, accepted, accepted_mail_sent, end_mail_sent FROM participant WHERE prediction_hash = ", ""])), hash)).then(function (cursor) { return cursor.rows; })];
            case 3:
                participants = _a.sent();
                result = __assign({}, prediction, { creater: creater,
                    participants: participants });
                return [2, result];
        }
    });
}); };
export var getNextPrediction = function () { return queryString("\nSELECT finish_date, prediction.hash FROM prediction\nJOIN creater on prediction.hash = creater.prediction_hash\nWHERE prediction.finish_date > now()\n  AND creater.accepted = true\nORDER BY finish_date asc limit 1\n").then(function (cursor) { return cursor.rows; }); };
export var getOldBetWithUnsentCreaterAcceptMails = function () { return queryString("\nSELECT DISTINCT prediction.hash FROM prediction\nJOIN creater on prediction.hash = creater.prediction_hash\nWHERE creater.accepted_mail_sent = false \n").then(function (cursor) { return cursor.rows; }); };
export var getOldBetWithUnsentAcceptMails = function () { return queryString("\nSELECT DISTINCT prediction.hash FROM prediction\nJOIN participant on prediction.hash = participant.prediction_hash\nJOIN creater on prediction.hash = creater.prediction_hash\nWHERE participant.accepted_mail_sent = false\n  AND creater.accepted = true\n").then(function (cursor) { return cursor.rows; }); };
export var getOldBetWithUnsentEndMails = function () { return queryString("\nSELECT DISTINCT prediction.hash FROM prediction\nJOIN participant on prediction.hash = participant.prediction_hash\nJOIN creater on prediction.hash = creater.prediction_hash\nWHERE prediction.finish_date < now() and participant.end_mail_sent = false\n  AND creater.accepted = true\n").then(function (cursor) { return cursor.rows; }); };
export var createPrediction = function (title, body, finishDate, isPublic, createrMail, participantList) { return __awaiter(_this, void 0, void 0, function () {
    var hash, promises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = uuid();
                return [4, query(SQL(templateObject_4 || (templateObject_4 = __makeTemplateObject(["INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(", ", ", ", ", ", ", ", ", ")"], ["INSERT INTO prediction (title, body, hash, finish_date, public) VALUES(", ", ", ", ", ", ", ", ", ")"])), title, body, hash, finishDate, isPublic))];
            case 1:
                _a.sent();
                return [4, createCreater(hash, createrMail)];
            case 2:
                _a.sent();
                promises = participantList.map(function (participant) { return createParticipant(hash, participant); });
                return [4, Promise.all(promises)];
            case 3:
                _a.sent();
                return [2, handleUnsentCreaterAcceptEmail(hash)];
        }
    });
}); };
export var createCreater = function (predictionHash, mail) { return __awaiter(_this, void 0, void 0, function () {
    var hash;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = uuid();
                return [4, confirmAccountExistance(mail)];
            case 1:
                _a.sent();
                return [2, query(SQL(templateObject_5 || (templateObject_5 = __makeTemplateObject(["INSERT INTO creater (hash, prediction_hash, mail) VALUES (", ", ", ", ", ")"], ["INSERT INTO creater (hash, prediction_hash, mail) VALUES (", ", ", ", ", ")"])), hash, predictionHash, mail))];
        }
    });
}); };
export var createParticipant = function (predictionHash, mail) { return __awaiter(_this, void 0, void 0, function () {
    var hash;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = uuid();
                return [4, confirmAccountExistance(mail)];
            case 1:
                _a.sent();
                return [2, query(SQL(templateObject_6 || (templateObject_6 = __makeTemplateObject(["INSERT INTO participant (hash, prediction_hash, mail) VALUES (", ", ", ", ", ")"], ["INSERT INTO participant (hash, prediction_hash, mail) VALUES (", ", ", ", ", ")"])), hash, predictionHash, mail))];
        }
    });
}); };
export var setCreaterAcceptMailSent = function (hash) { return query(SQL(templateObject_7 || (templateObject_7 = __makeTemplateObject(["UPDATE creater SET accepted_mail_sent = true where hash = ", ""], ["UPDATE creater SET accepted_mail_sent = true where hash = ", ""])), hash)); };
export var setParticipantAcceptMailSent = function (hash) { return query(SQL(templateObject_8 || (templateObject_8 = __makeTemplateObject(["UPDATE participant SET accepted_mail_sent = true where hash = ", ""], ["UPDATE participant SET accepted_mail_sent = true where hash = ", ""])), hash)); };
export var updateCreaterAcceptStatus = function (predictionHash, hash, accepted) { return __awaiter(_this, void 0, void 0, function () {
    var prediction;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, query(SQL(templateObject_9 || (templateObject_9 = __makeTemplateObject(["UPDATE creater SET accepted = ", ", accepted_date = now() where prediction_hash = ", " AND hash = ", ""], ["UPDATE creater SET accepted = ", ", accepted_date = now() where prediction_hash = ", " AND hash = ", ""])), accepted, predictionHash, hash))];
            case 1:
                _a.sent();
                return [4, getPrediction(predictionHash)];
            case 2:
                prediction = _a.sent();
                return [4, validateAccount(prediction.creater.mail)];
            case 3:
                _a.sent();
                return [2, handleUnsentAcceptEmail(predictionHash)];
        }
    });
}); };
export var updateParticipantAcceptStatus = function (predictionHash, hash, accepted) { return __awaiter(_this, void 0, void 0, function () {
    var prediction, participant;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, query(SQL(templateObject_10 || (templateObject_10 = __makeTemplateObject(["UPDATE participant SET accepted = ", ", accepted_date = now() where prediction_hash = ", " AND hash = ", ""], ["UPDATE participant SET accepted = ", ", accepted_date = now() where prediction_hash = ", " AND hash = ", ""])), accepted, predictionHash, hash))];
            case 1:
                _a.sent();
                return [4, getPrediction(predictionHash)];
            case 2:
                prediction = _a.sent();
                participant = prediction.participants.find(function (p) { return p.hash === hash; });
                return [2, validateAccount(participant.mail)];
        }
    });
}); };
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10;
//# sourceMappingURL=prediction.js.map