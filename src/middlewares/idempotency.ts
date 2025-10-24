import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

export default async function idempotency(req: Request, res: Response, next: NextFunction) {
  try {
    const key = (req.headers['idempotency-key'] as string) || undefined;
    if (!key) return next();

    const record = await prisma.idempotencyKey.findUnique({ where: { key } });
    if (record && record.responseBody) {
      return res.status(record.responseStatus || 200).json(record.responseBody);
    }

    req.idempotencyKey = key;
    return next();
  } catch (err) {
    return next(err);
  }
}
