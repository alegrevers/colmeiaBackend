import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService';

export async function createCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await customerService.createCustomer(req.body);
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
}
