import { Request, Response, NextFunction } from 'express';
import logger from './logger';

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  if (
    error.name === 'MongoServerError' &&
    typeof (error as any).code === 'number' &&
    (error as any).code === 11000
  ) {
    return res.status(400).json({ error: 'username must be unique' });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' });
  }
  next(error);
};

export default errorHandler;
