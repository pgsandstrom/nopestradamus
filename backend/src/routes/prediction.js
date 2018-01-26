import {
  getLatestPredictions,
  getPrediction,
  createPrediction,
  updateCreaterAcceptStatus,
  updateParticipantAcceptStatus,
  getCensoredPrediction,
} from '../controller/prediction';
import { getError } from '../util/genericError';

export default (server) => {
  server.get('/api/v1/prediction', async (req, res, next) => {
    try {
      const predictions = await getLatestPredictions();
      res.send(predictions);
      next();
    } catch (e) {
      next(getError(e));
    }
  });

  server.get('/api/v1/prediction/:hash', async (req, res, next) => {
    try {
      const hash = req.params.hash;
      const prediction = await getPrediction(hash);
      const censoredPrediction = getCensoredPrediction(prediction);
      res.send(censoredPrediction);
      next();
    } catch (e) {
      next(getError(e));
    }
  });

  server.put('/api/v1/prediction', async (req, res, next) => {
    const body = JSON.parse(req.body);
    try {
      await createPrediction(body.title, body.body, body.finishDate, body.isPublic, body.creater, body.participantList);
      res.send('ok');
      next();
    } catch (e) {
      next(getError(e));
    }
  });

  server.post('/api/v1/prediction/:prediction/creater/:hash/accept', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateCreaterAcceptStatus(predictionHash, hash, true);
      res.send('ok');
      next();
    } catch (e) {
      next(getError(e));
    }
  });

  server.post('/api/v1/prediction/:prediction/creater/:hash/deny', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateCreaterAcceptStatus(predictionHash, hash, false);
      res.send('ok');
      next();
    } catch (e) {
      next(getError(e));
    }
  });

  server.post('/api/v1/prediction/:prediction/participant/:hash/accept/', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateParticipantAcceptStatus(predictionHash, hash, true);
      res.send('ok');
      next();
    } catch (e) {
      next(getError(e));
    }
  });

  server.post('/api/v1/prediction/:prediction/participant/:hash/deny/', async (req, res, next) => {
    const predictionHash = req.params.prediction;
    const hash = req.params.hash;
    try {
      await updateParticipantAcceptStatus(predictionHash, hash, false);
      res.send('ok');
      next();
    } catch (e) {
      next(getError(e));
    }
  });
};
