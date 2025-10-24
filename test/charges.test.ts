import axios from 'axios';
import app from '../src/app';
import prisma from '../src/prismaClient';

let customerId: string | null = null;
let server: any;
const BASE_URL = 'http://localhost:3001';

beforeAll(async () => {
  server = app.listen(3001, () => {
    console.log('Test server running on port 3001');
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  const existing = await prisma.customer.findFirst();
  if (existing) {
    customerId = existing.id;
  } else {
    const c = await prisma.customer.create({
      data: {
        name: 'Test Charge Customer',
        email: `test.charge.${Date.now()}@example.com`,
        document: `${Date.now()}`,
      },
    });
    customerId = c.id;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
  if (server) {
    server.close();
  }
});

describe('Charges API', () => {
  it('creates a pix charge', async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/charges`, {
        customer_id: customerId,
        amount: 15000,
        payment_method: 'pix',
        payment_details: { pix_key: 'test@pix' },
      }, {
        headers: {
          'Idempotency-Key': `pix-${Date.now()}`,
        },
        validateStatus: () => true,
      });

      expect([201, 200]).toContain(res.status);
      if (res.status === 201) {
        expect(res.data).toHaveProperty('id');
        expect(res.data.paymentDetails).toHaveProperty('pix_key');
      }
    } catch (error) {
      throw error;
    }
  });
});