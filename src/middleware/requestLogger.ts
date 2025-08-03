import { Request, Response, NextFunction } from 'express';
import logger from '@/middleware/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Method:', req.method);
  logger.info('Path:', req.path);
  logger.info('Body:', req.body);
  logger.info('---');
  next();
};

export default requestLogger;
