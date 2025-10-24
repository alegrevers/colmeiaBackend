import { z } from 'zod';

export const chargeValidator = z.object({
  customer_id: z.string().uuid(),
  amount: z.number().int().positive(),
  currency: z.string().default('BRL'),
  payment_method: z.enum(['pix', 'card', 'boleto']),
  payment_details: z.any(),
  metadata: z.any().optional(),
});
