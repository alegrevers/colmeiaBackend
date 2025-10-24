import prisma from '../prismaClient';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  document: z.string().min(3),
  phone: z.string().optional(),
});

export async function createCustomer(data: any) {
  const validated = customerSchema.parse(data);

  const exists = await prisma.customer.findFirst({
    where: { OR: [{ email: validated.email }, { document: validated.document }] },
  });

  if (exists) {
    throw { status: 409, message: 'Email ou documento já cadastrado' };
  }

  const created = await prisma.customer.create({ data: validated });
  return created;
}
