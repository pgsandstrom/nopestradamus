import {Request, Response, Next} from "restify"

export default () => (req: Request, res: Response, next: Next) => {
  res.setHeader('Cache-control', 'no-cache');
  next();
};
