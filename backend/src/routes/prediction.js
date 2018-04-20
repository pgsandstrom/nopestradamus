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
import { getLatestPredictions, getPrediction, createPrediction, updateCreaterAcceptStatus, updateParticipantAcceptStatus, getCensoredPrediction, } from '../controller/prediction';
import { getError } from '../util/genericError';
export default (function (server) {
    server.get('/api/v1/prediction', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var predictions, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, getLatestPredictions()];
                case 1:
                    predictions = _a.sent();
                    res.send(predictions);
                    next();
                    return [3, 3];
                case 2:
                    e_1 = _a.sent();
                    next(getError(e_1));
                    return [3, 3];
                case 3: return [2];
            }
        });
    }); });
    server.get('/api/v1/prediction/:hash', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var hash, prediction, censoredPrediction, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    hash = req.params.hash;
                    return [4, getPrediction(hash)];
                case 1:
                    prediction = _a.sent();
                    censoredPrediction = getCensoredPrediction(prediction);
                    res.send(censoredPrediction);
                    next();
                    return [3, 3];
                case 2:
                    e_2 = _a.sent();
                    next(getError(e_2));
                    return [3, 3];
                case 3: return [2];
            }
        });
    }); });
    server.get('/api/v1/prediction/:prediction/participant/:hash', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var predictionHash, participantHash, prediction, censoredPrediction, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    predictionHash = req.params.prediction;
                    participantHash = req.params.hash;
                    return [4, getPrediction(predictionHash)];
                case 1:
                    prediction = _a.sent();
                    censoredPrediction = getCensoredPrediction(prediction, [participantHash]);
                    res.send(censoredPrediction);
                    next();
                    return [3, 3];
                case 2:
                    e_3 = _a.sent();
                    next(getError(e_3));
                    return [3, 3];
                case 3: return [2];
            }
        });
    }); });
    server.put('/api/v1/prediction', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var body, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = JSON.parse(req.body);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, createPrediction(body.title, body.body, body.finishDate, body.isPublic, body.creater, body.participantList)];
                case 2:
                    _a.sent();
                    res.send('ok');
                    next();
                    return [3, 4];
                case 3:
                    e_4 = _a.sent();
                    next(getError(e_4));
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
    server.post('/api/v1/prediction/:prediction/creater/:hash/accept', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var predictionHash, hash, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    predictionHash = req.params.prediction;
                    hash = req.params.hash;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, updateCreaterAcceptStatus(predictionHash, hash, true)];
                case 2:
                    _a.sent();
                    res.send('ok');
                    next();
                    return [3, 4];
                case 3:
                    e_5 = _a.sent();
                    next(getError(e_5));
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
    server.post('/api/v1/prediction/:prediction/creater/:hash/deny', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var predictionHash, hash, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    predictionHash = req.params.prediction;
                    hash = req.params.hash;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, updateCreaterAcceptStatus(predictionHash, hash, false)];
                case 2:
                    _a.sent();
                    res.send('ok');
                    next();
                    return [3, 4];
                case 3:
                    e_6 = _a.sent();
                    next(getError(e_6));
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
    server.post('/api/v1/prediction/:prediction/participant/:hash/accept/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var predictionHash, hash, e_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    predictionHash = req.params.prediction;
                    hash = req.params.hash;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, updateParticipantAcceptStatus(predictionHash, hash, true)];
                case 2:
                    _a.sent();
                    res.send('ok');
                    next();
                    return [3, 4];
                case 3:
                    e_7 = _a.sent();
                    next(getError(e_7));
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
    server.post('/api/v1/prediction/:prediction/participant/:hash/deny/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var predictionHash, hash, e_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    predictionHash = req.params.prediction;
                    hash = req.params.hash;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, updateParticipantAcceptStatus(predictionHash, hash, false)];
                case 2:
                    _a.sent();
                    res.send('ok');
                    next();
                    return [3, 4];
                case 3:
                    e_8 = _a.sent();
                    next(getError(e_8));
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
});
//# sourceMappingURL=prediction.js.map