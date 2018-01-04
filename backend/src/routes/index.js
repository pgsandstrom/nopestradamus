import prediction from './prediction';

export default (server) => {
  prediction(server);

  server.get('/api/v1', (req, res, next) => {
    res.send('hello');
    next();
  });
};
