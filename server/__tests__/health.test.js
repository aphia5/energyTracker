const request  = require('supertest');
const { buildTestApp } = require('./dummyDB');

const app = buildTestApp();

describe('GET /api/health', () => {
  it('returns 200',           async () => { expect((await request(app).get('/api/health')).statusCode).toBe(200); });
  it('returns status ok',     async () => { expect((await request(app).get('/api/health')).body.status).toBe('ok'); });
  it('returns a timestamp',   async () => { expect((await request(app).get('/api/health')).body).toHaveProperty('timestamp'); });
  it('timestamp is a valid date', async () => {
    const res = await request(app).get('/api/health');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
  it('timestamp is recent', async () => {
    const res = await request(app).get('/api/health');
    expect(Date.now() - new Date(res.body.timestamp).getTime()).toBeLessThan(5000);
  });
});
