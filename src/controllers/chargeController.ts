import { Request, Response, NextFunction } from 'express';
import * as chargeService from '../services/chargeService';

export async function createCharge(req: Request, res: Response, next: NextFunction) {
  try {
    const idempotencyKey = req.idempotencyKey;
    const charge = await chargeService.createCharge(req.body, idempotencyKey);
    return res.status(201).json(charge);
  } catch (err) {
    return next(err);
  }
}

export async function getCharge(req: Request, res: Response, next: NextFunction) {
  try {
    const charge = await chargeService.getCharge(req.params.id);
    return res.json(charge);
  } catch (err) {
    return next(err);
  }
}

export async function updateChargeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await chargeService.updateChargeStatus(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}
