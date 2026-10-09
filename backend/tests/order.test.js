const request = require('supertest');
const app = require('../src/server');
const redis = require('../src/config/redis');

describe('Order Lifecycle API Tests', () => {
  afterAll(async () => {
    try {
      if (redis && typeof redis.disconnect === 'function') {
        redis.disconnect();
      }
    } catch (e) {
      // sessizce kapat
    }
  });

  it('GET /api/orders/health or /api/health should respond', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('GET /api/orders/my-orders without auth should return 401', async () => {
    const res = await request(app).get('/api/orders/my-orders');
    expect(res.statusCode).toBe(401);
  });

  it('PUT /api/orders/invalid-id/cancel without auth should return 401', async () => {
    const res = await request(app)
      .put('/api/orders/invalid-id/cancel')
      .send({ reason: 'Test' });
    expect(res.statusCode).toBe(401);
  });
});
