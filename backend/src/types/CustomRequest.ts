import { Request } from 'express';

export interface CustomRequest<
  Params = Record<string, any>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user: {
    id: string;
  };
}
