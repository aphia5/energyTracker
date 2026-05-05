const request  = require('supertest');
const { buildTestApp } = require('./dummyDB');
const { validKwhValues, invalidKwhValues } = require('./dummyEnergy');

const app = buildTestApp([
  { path: '/api/energy', router: require('../routes/energy') },
]);

describe('GET /api/energy/rooms', () => {
  it('returns 200 with array',          async () => { const r = await request(app).get('/api/energy/rooms'); expect(r.statusCode).toBe(200); expect(Array.isArray(r.body)).toBe(true); });
  it('returns at least one room',       async () => { expect((await request(app).get('/api/energy/rooms')).body.length).toBeGreaterThan(0); });
  it('rooms have id, name, floor',      async () => { const r = await request(app).get('/api/energy/rooms'); expect(r.body[0]).toHaveProperty('id'); expect(r.body[0]).toHaveProperty('name'); expect(r.body[0]).toHaveProperty('floor'); });
});

describe('POST /api/energy/rooms/:id/readings', () => {
  it('creates reading and returns 201', async () => {
    const r = await request(app).post('/api/energy/rooms/1/readings').send({ kwh: 2.75 });
    expect(r.statusCode).toBe(201);
    expect(r.body.kwh).toBe(2.75);
  });
  it('accepts all valid kwh values', async () => {
    for (const kwh of validKwhValues) {
      const r = await request(app).post('/api/energy/rooms/1/readings').send({ kwh });
      expect(r.statusCode).toBe(201);
    }
  });
  it('rejects invalid kwh values with 400', async () => {
    for (const kwh of invalidKwhValues) {
      const r = await request(app).post('/api/energy/rooms/1/readings').send({ kwh });
      expect(r.statusCode).toBe(400);
    }
  });
  it('returns 404 for non-existent room', async () => {
    expect((await request(app).post('/api/energy/rooms/99999/readings').send({ kwh: 1 })).statusCode).toBe(404);
  });
});

describe('GET /api/energy/daily', () => {
  it('returns 200 with array',      async () => { const r = await request(app).get('/api/energy/daily'); expect(r.statusCode).toBe(200); expect(Array.isArray(r.body)).toBe(true); });
  it('entries have date, total_kwh', async () => { const r = await request(app).get('/api/energy/daily'); if (r.body.length > 0) { expect(r.body[0]).toHaveProperty('date'); expect(r.body[0]).toHaveProperty('total_kwh'); } });
});

describe('GET /api/energy/summary', () => {
  it('returns all KPI fields', async () => {
    const r = await request(app).get('/api/energy/summary');
    expect(r.statusCode).toBe(200);
    ['today_kwh','yesterday_kwh','change_percent','weekly_avg_kwh'].forEach(f => expect(r.body).toHaveProperty(f));
  });
});

describe('GET /api/energy/contributions', () => {
  it('returns sorted by total_kwh desc', async () => {
    const r = await request(app).get('/api/energy/contributions');
    expect(r.statusCode).toBe(200);
    for (let i = 1; i < r.body.length; i++) expect(r.body[i-1].total_kwh).toBeGreaterThanOrEqual(r.body[i].total_kwh);
  });
});
