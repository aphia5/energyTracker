const request  = require('supertest');
const { buildTestApp } = require('./dummyDB');
const { validKwhValues, invalidKwhValues } = require('./dummyEnergy');

const app = buildTestApp([
  { path: '/api/energy', router: require('../routes/energy') },
]);

describe('Input validation', () => {
  it('accepts valid decimal kwh values', async () => {
    for (const kwh of validKwhValues) {
      expect((await request(app).post('/api/energy/rooms/1/readings').send({ kwh })).statusCode).toBe(201);
    }
  });
  it('rejects all invalid kwh values', async () => {
    for (const kwh of invalidKwhValues) {
      expect((await request(app).post('/api/energy/rooms/1/readings').send({ kwh })).statusCode).toBe(400);
    }
  });
  it('days param smaller range returns fewer or equal results', async () => {
    const r7  = await request(app).get('/api/energy/daily?days=7');
    const r30 = await request(app).get('/api/energy/daily?days=30');
    expect(r7.body.length).toBeLessThanOrEqual(r30.body.length);
  });
});
