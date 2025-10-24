import axios from 'axios';
import app from '../src/app';
import prisma from '../src/prismaClient';

let server: any;
const BASE_URL = 'http://localhost:3001';

beforeAll(async () => {
  server = app.listen(3001, () => {
    console.log('Test server running on port 3001');
  });

  await new Promise(resolve => setTimeout(resolve, 500));
});

afterAll(async () => {
  await prisma.$disconnect();
  if (server) {
    server.close();
  }
});

describe('Customers API', () => {
  it('creates a customer', async () => {
    const res = await axios.post(`${BASE_URL}/api/v1/customers`, {
      name: 'Gabriel Test',
      email: `gabriel.test+${Date.now()}@example.com`,
      document: `0000000000${Date.now()}`,
      phone: '+55 11 99999-0000',
    }, {
      validateStatus: () => true,
    });

    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('email');
    }
  });
});