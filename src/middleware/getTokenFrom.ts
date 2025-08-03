import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      token?: string | null;
    }
  }
}

const getTokenFrom = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '');
  } else {
    req.token = null;
  }
  next();
};

export default getTokenFrom;
