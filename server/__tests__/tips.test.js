const request  = require('supertest');
const { buildTestApp } = require('./dummyDB');
const { dummyUsers } = require('./dummyAuth');
const { dummyTips, invalidTips } = require('./dummyTips');

const app = buildTestApp([
  { path: '/api/auth', router: require('../routes/auth') },
  { path: '/api/tips', router: require('../routes/tips') },
]);

let adminToken, studentToken;
beforeAll(async () => {
  adminToken   = (await request(app).post('/api/auth/login').send(dummyUsers.admin)).body.token;
  studentToken = (await request(app).post('/api/auth/login').send(dummyUsers.student)).body.token;
});

describe('GET /api/tips', () => {
  it('returns 200 for everyone',         async () => { expect((await request(app).get('/api/tips')).statusCode).toBe(200); });
  it('sorted by saving_kwh descending',  async () => { const r = await request(app).get('/api/tips'); for (let i=1;i<r.body.length;i++) expect(r.body[i-1].saving_kwh).toBeGreaterThanOrEqual(r.body[i].saving_kwh); });
});

describe('POST /api/tips — admin only', () => {
  it('admin can create tip',              async () => { expect((await request(app).post('/api/tips').set('Authorization',`Bearer ${adminToken}`).send(dummyTips[0])).statusCode).toBe(201); });
  it('student gets 403',                  async () => { expect((await request(app).post('/api/tips').set('Authorization',`Bearer ${studentToken}`).send(dummyTips[0])).statusCode).toBe(403); });
  it('unauthenticated gets 401',          async () => { expect((await request(app).post('/api/tips').send(dummyTips[0])).statusCode).toBe(401); });
  it('rejects tips with missing fields',  async () => {
    for (const tip of invalidTips) {
      expect((await request(app).post('/api/tips').set('Authorization',`Bearer ${adminToken}`).send(tip)).statusCode).toBe(400);
    }
  });
});

describe('DELETE /api/tips — admin only', () => {
  let tipId;
  beforeAll(async () => {
    const r = await request(app).post('/api/tips').set('Authorization',`Bearer ${adminToken}`).send(dummyTips[1]);
    tipId = r.body.id;
  });
  it('student cannot delete',     async () => { expect((await request(app).delete(`/api/tips/${tipId}`).set('Authorization',`Bearer ${studentToken}`)).statusCode).toBe(403); });
  it('admin can delete',          async () => { expect((await request(app).delete(`/api/tips/${tipId}`).set('Authorization',`Bearer ${adminToken}`)).statusCode).toBe(200); });
  it('returns 404 after delete',  async () => { expect((await request(app).delete(`/api/tips/${tipId}`).set('Authorization',`Bearer ${adminToken}`)).statusCode).toBe(404); });
});
