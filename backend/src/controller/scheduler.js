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
import * as moment from 'moment';
import { getOldBetWithUnsentAcceptMails, getOldBetWithUnsentEndMails, getNextPrediction, getPrediction, getOldBetWithUnsentCreaterAcceptMails, setCreaterAcceptMailSent, setParticipantAcceptMailSent, } from './prediction';
import { sendAcceptMail, sendCreaterAcceptMail, sendEndMail } from './mailer';
import { isMailValid } from '../util/mail-util';
export var init = function () { return __awaiter(_this, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4, handleAllUnsentCreaterAcceptEmails()];
            case 1:
                _a.sent();
                return [4, handleAllUnsentAcceptEmails()];
            case 2:
                _a.sent();
                return [4, handleAllUnsentEndEmails()];
            case 3:
                _a.sent();
                return [4, ensureWaitingForBet()];
            case 4:
                _a.sent();
                return [3, 6];
            case 5:
                e_1 = _a.sent();
                console.error('INIT FAILED');
                console.log(e_1);
                throw e_1;
            case 6: return [2];
        }
    });
}); };
var isWaiting = false;
export var ensureWaitingForBet = function () { return __awaiter(_this, void 0, void 0, function () {
    var predictionList, prediction_1, finishDateMoment, msDiff;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(isWaiting === false)) return [3, 2];
                return [4, getNextPrediction()];
            case 1:
                predictionList = _a.sent();
                if (predictionList.length > 0) {
                    prediction_1 = predictionList[0];
                    finishDateMoment = moment(prediction_1.finish_date);
                    msDiff = finishDateMoment.diff(moment());
                    console.log("waiting " + msDiff + "ms for bet " + prediction_1.hash);
                    isWaiting = true;
                    setTimeout(function () {
                        handleUnsentEndEmail(prediction_1.hash);
                        isWaiting = false;
                        ensureWaitingForBet();
                    }, msDiff);
                }
                else {
                    console.log('No promise to wait for');
                }
                return [3, 3];
            case 2:
                console.log('Already waiting for bet, not waiting again');
                _a.label = 3;
            case 3: return [2];
        }
    });
}); };
var handleAllUnsentCreaterAcceptEmails = function () { return __awaiter(_this, void 0, void 0, function () {
    var unsentCreaterAcceptMails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getOldBetWithUnsentCreaterAcceptMails()];
            case 1:
                unsentCreaterAcceptMails = _a.sent();
                unsentCreaterAcceptMails.forEach(function (item) { return handleUnsentCreaterAcceptEmail(item.hash); });
                return [2];
        }
    });
}); };
var handleAllUnsentAcceptEmails = function () { return __awaiter(_this, void 0, void 0, function () {
    var unsentAcceptMails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getOldBetWithUnsentAcceptMails()];
            case 1:
                unsentAcceptMails = _a.sent();
                unsentAcceptMails.forEach(function (item) { return handleUnsentAcceptEmail(item.hash); });
                return [2];
        }
    });
}); };
var handleAllUnsentEndEmails = function () { return __awaiter(_this, void 0, void 0, function () {
    var unsentEndMails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getOldBetWithUnsentEndMails()];
            case 1:
                unsentEndMails = _a.sent();
                unsentEndMails.forEach(function (item) { return handleUnsentEndEmail(item.hash); });
                return [2];
        }
    });
}); };
export var handleUnsentCreaterAcceptEmail = function (hash) { return __awaiter(_this, void 0, void 0, function () {
    var prediction, mail, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getPrediction(hash)];
            case 1:
                prediction = _a.sent();
                mail = prediction.creater.mail;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 8]);
                if (!isMailValid(mail)) return [3, 4];
                return [4, sendCreaterAcceptMail(prediction)];
            case 3:
                _a.sent();
                return [3, 5];
            case 4:
                console.log("creater skipping invalid mail: " + mail);
                _a.label = 5;
            case 5: return [4, setCreaterAcceptMailSent(prediction.creater.hash)];
            case 6:
                _a.sent();
                return [3, 8];
            case 7:
                e_2 = _a.sent();
                console.error("failed sending creater accept mail to " + mail);
                return [3, 8];
            case 8: return [2];
        }
    });
}); };
export var handleUnsentAcceptEmail = function (hash) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    var prediction, createrMail, mails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getPrediction(hash)];
            case 1:
                prediction = _a.sent();
                createrMail = prediction.creater.mail;
                mails = prediction.participants.filter(function (participant) { return participant.accepted_mail_sent === false; }).map(function (participant) { return participant.mail; });
                mails.forEach(function (mail) { return __awaiter(_this, void 0, void 0, function () {
                    var participant, e_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                participant = prediction.participants.find(function (p) { return p.mail === mail; });
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 6, , 7]);
                                if (!isMailValid(mail)) return [3, 3];
                                return [4, sendAcceptMail(mail, createrMail, prediction.title, prediction.body, prediction.finish_date, hash, participant.hash)];
                            case 2:
                                _a.sent();
                                return [3, 4];
                            case 3:
                                console.log("participant skipping invalid mail: " + mail);
                                _a.label = 4;
                            case 4: return [4, setParticipantAcceptMailSent(participant.hash)];
                            case 5:
                                _a.sent();
                                return [3, 7];
                            case 6:
                                e_3 = _a.sent();
                                console.error("failed sending accept mail to " + mail);
                                return [3, 7];
                            case 7: return [2];
                        }
                    });
                }); });
                return [2];
        }
    });
}); };
var handleUnsentEndEmail = function (hash) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    var prediction, createrMail, mails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getPrediction(hash)];
            case 1:
                prediction = _a.sent();
                createrMail = prediction.creater.mail;
                mails = prediction.participants
                    .filter(function (participant) { return participant.accepted; })
                    .filter(function (participant) { return participant.end_mail_sent === false; })
                    .map(function (participant) { return participant.mail; });
                mails.forEach(function (mail) { return __awaiter(_this, void 0, void 0, function () {
                    var participant, e_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                participant = prediction.participants.find(function (p) { return p.mail === mail; });
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 5, , 6]);
                                if (!isMailValid(mail)) return [3, 3];
                                return [4, sendEndMail(mail, createrMail, prediction.title, prediction.body, participant.accepted_date, hash)];
                            case 2:
                                _a.sent();
                                return [3, 4];
                            case 3:
                                console.log("endmail skipping invalid mail: " + mail);
                                _a.label = 4;
                            case 4: return [3, 6];
                            case 5:
                                e_4 = _a.sent();
                                console.error("failed sending end mail to " + mail);
                                return [3, 6];
                            case 6: return [2];
                        }
                    });
                }); });
                return [2];
        }
    });
}); };
//# sourceMappingURL=scheduler.js.map