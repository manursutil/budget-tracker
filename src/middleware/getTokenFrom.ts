import { Request } from 'express';

const getTokenFrom = (req: Request): string | null => {
  const authorization = req.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

export default getTokenFrom;
