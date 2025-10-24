import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  const details = err?.details;
  res.status(status).json({ status: 'error', message, details });
}
