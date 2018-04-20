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
import * as nodemailer from 'nodemailer';
import * as moment from 'moment';
import { getPrivateKey } from '../util/config';
import { isDev } from '../util/env';
export var sendCreaterAcceptMail = function (prediction) { return __awaiter(_this, void 0, void 0, function () {
    var mailTitle, mailBody;
    return __generator(this, function (_a) {
        console.log("sending creater accept mail to " + prediction.creater.mail);
        mailTitle = 'Nopestradamus: Validate your mail for your bet!';
        mailBody = "Below is the bet that was created by this mail:\n\n---\n\nTitle: " + prediction.title + "\n\n" + prediction.body + "\n\n---\n\nTo validate or deny this prediction, visit the following link:\nhttp://nopestradamus.com/prediction/" + prediction.hash + "/creater/" + prediction.creater.hash + "\n\nTo get an overview of the bet before you accept visit this link:\nhttp://nopestradamus.com/prediction/" + prediction.hash;
        return [2, sendMail(prediction.creater.mail, mailTitle, mailBody)];
    });
}); };
export var sendAcceptMail = function (receiver, createrMail, title, body, finishDate, predictionHash, acceptHash) { return __awaiter(_this, void 0, void 0, function () {
    var mailTitle, mailBody;
    return __generator(this, function (_a) {
        console.log("sending accept mail to " + receiver);
        mailTitle = "Your opinion has been requested by " + createrMail + "!";
        mailBody = createrMail + " has asked you to accept a bet! The bet is described below\n\n---\n\nTitle: " + title + "\n\n" + body + "\n\n---\n\nThe bet ends at " + moment(finishDate).format('YYYY MM DD') + ". At the given date, you will all receive a mail and be confronted with your predictions!\nTo accept or deny the bet, click the following link:\nhttp://nopestradamus.com/prediction/" + predictionHash + "/participant/" + acceptHash + "\n\nTo get an overview of the bet before you accept\nhttp://nopestradamus.com/prediction/" + predictionHash + "\n";
        return [2, sendMail(receiver, mailTitle, mailBody)];
    });
}); };
export var sendEndMail = function (receiver, createrMail, title, body, acceptedDate, predictionHash) { return __awaiter(_this, void 0, void 0, function () {
    var mailTitle, mailBody;
    return __generator(this, function (_a) {
        console.log("sending end mail to " + receiver);
        mailTitle = "Your bet from " + createrMail + " has finished!!!";
        mailBody = "A bet was accepted by you on " + moment(acceptedDate).format('YYYY MM DD') + " by " + createrMail + ". It has now finished! Here is the bet:\n\n---\n\nTitle: " + title + "\n\n" + body + "\n\n---\n\nTo get an overview of the bet visit this link:\nhttp://nopestradamus.com/prediction/" + predictionHash + "\n\nNow you must discuss who won the bet!";
        return [2, sendMail(receiver, mailTitle, mailBody)];
    });
}); };
var sendMail = function (receiver, title, body) { return __awaiter(_this, void 0, void 0, function () {
    var privateKey, transporter, mailOptions, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (isDev()) {
                    console.log('faking sending mail');
                    return [2, Promise.resolve()];
                }
                privateKey = getPrivateKey();
                transporter = nodemailer.createTransport({
                    host: 'localhost',
                    port: 25,
                    secure: false,
                    dkim: {
                        domainName: 'nopestradamus.com',
                        keySelector: 'hej',
                        privateKey: privateKey
                    }
                });
                mailOptions = {
                    from: '"Nopestradamus" <no-reply@nopestradamus.com>',
                    to: [receiver],
                    subject: title,
                    text: body
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, transporter.verify()];
            case 2:
                _a.sent();
                return [2, transporter.sendMail(mailOptions)];
            case 3:
                e_1 = _a.sent();
                console.log("send mail fail: " + e_1);
                throw e_1;
            case 4: return [2];
        }
    });
}); };
//# sourceMappingURL=mailer.js.map