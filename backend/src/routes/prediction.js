import { getPredictions, getPrediction, createPrediction } from '../controller/prediction';

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
    await createPrediction(body.title, body.body, body.finishDate, body.isPublic, body.creator, body.participantList);
    res.send('ok');
    next();
  });
};
