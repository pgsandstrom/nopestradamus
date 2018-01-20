import { getPredictions, getPrediction, createPrediction } from '../controller/prediction';
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
};
