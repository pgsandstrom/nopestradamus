import { getPredictions, getPrediction, createPrediction, updateCreaterAccepted, updateParticipantAccepted } from '../controller/prediction';
import { getError } from '../util/genericError';

export default (server) => {
  server.get('/api/v1/prediction', async (req, res, next) => {
    const value = await getPredictions();
    res.send(value);
    next();
  });

  server.get('/api/v1/prediction/:hash', async (req, res, next) => {
    const hash = req.params.hash;
    const value = await getPrediction(hash);
    res.send(value);
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
