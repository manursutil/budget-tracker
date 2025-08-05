import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, status = 200) => {
  res.status(status).json({ success: true, data });
};

export const sendError = (res: Response, message: string, status = 500) => {
  res.status(status).json({ success: false, error: message });
};
