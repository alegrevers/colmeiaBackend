import { Router } from 'express';
import idempotency from '../middlewares/idempotency';
import { createCharge, getCharge, updateChargeStatus } from '../controllers/chargeController';

const router = Router();

router.post('/', idempotency, createCharge);
router.get('/:id', getCharge);
router.patch('/:id/status', updateChargeStatus);

export default router;
