import {Request, Response, Next} from "restify"
import prediction from './prediction';

export default (server) => {
  prediction(server);

  server.get('/api/v1', (req: Request, res: Response, next: Next) => {
    res.send('hello');
    next();
  });
};
