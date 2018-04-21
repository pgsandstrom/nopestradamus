import {Request, Response, Next, Server} from "restify"
import prediction from './prediction';

export default (server:Server) => {
  prediction(server);

  server.get('/api/v1', (req: Request, res: Response, next: Next) => {
    res.send('hello');
    next();
  });
};
