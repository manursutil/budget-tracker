import config from '@/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const userExtractor = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.get('authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7);
    try {
      const decodedToken = jwt.verify(token, config.SECRET as string);
      if (
        typeof decodedToken === 'object' &&
        decodedToken !== null &&
        'id' in decodedToken
      ) {
        (req as any).user = (decodedToken as { id: string }).id;
      } else {
        return res.status(401).json({ error: 'Invalid token payload' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'Token missing' });
  }

  next();
};

export default userExtractor;
