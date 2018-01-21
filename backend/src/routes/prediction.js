import {
  getPredictions, getPrediction, createPrediction, updateCreaterAccepted, updateParticipantAccepted,
  getCensoredPrediction
} from '../controller/prediction';
import { getError } from '../util/genericError';

export default (server) => {
  server.get('/api/v1/prediction', async (req, res, next) => {
    const predictions = await getPredictions();
    const censoredPredictions = predictions.map(prediction => getCensoredPrediction(prediction));
    res.send(censoredPredictions);
    next();
  });

  server.get('/api/v1/prediction/:hash', async (req, res, next) => {
    const hash = req.params.hash;
    const prediction = await getPrediction(hash);
    const censoredPrediction = getCensoredPrediction(prediction);
    res.send(censoredPrediction);
    next();
  });

  server.put('/api/v1/prediction', async (req, res, next) => {
    const body = JSON.parse(req.body);
    try {
      await createPrediction(body.title, body.body, body.finishDate, body.isPublic, body.creater, body.participantList);
      res.send('ok');
    } catch (e) {
      next(getError(e));
    }
    next();
  });

  server.post('/api/v1/prediction/:prediction/creater/:hash/accept/', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateCreaterAccepted(predictionHash, hash, true);
      res.send('ok');
    } catch (e) {
      next(getError(e));
    }
    next();
  });

  server.post('/api/v1/prediction/:prediction/creater/:hash/deny/', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateCreaterAccepted(predictionHash, hash, false);
      res.send('ok');
    } catch (e) {
      next(getError(e));
    }
    next();
  });

  server.post('/api/v1/prediction/:prediction/participant/:hash/accept/', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateParticipantAccepted(predictionHash, hash, true);
      res.send('ok');
    } catch (e) {
      next(getError(e));
    }
    next();
  });

  server.post('/api/v1/prediction/:prediction/participant/:hash/deny/', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateParticipantAccepted(predictionHash, hash, false);
      res.send('ok');
    } catch (e) {
      next(getError(e));
    }
    next();
  });
};
