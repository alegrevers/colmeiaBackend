import express, { Router } from 'express';
import { createCustomer } from '../controllers/customerController';

const router = Router();

router.post('/', createCustomer);

export default router;
