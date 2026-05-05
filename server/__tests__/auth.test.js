const request  = require('supertest');
const { buildTestApp } = require('./dummyDB');
const { dummyUsers, dummyInvalidTokens } = require('./dummyAuth');

const app = buildTestApp([
  { path: '/api/auth', router: require('../routes/auth') },
]);

let adminToken, studentToken;

beforeAll(async () => {
  const a = await request(app).post('/api/auth/login').send(dummyUsers.admin);
  const s = await request(app).post('/api/auth/login').send(dummyUsers.student);
  adminToken   = a.body.token;
  studentToken = s.body.token;
});

describe('POST /api/auth/login', () => {
  it('returns 200 and token for valid student', async () => {
    const res = await request(app).post('/api/auth/login').send(dummyUsers.student);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
  it('returns 200 and token for valid admin', async () => {
    const res = await request(app).post('/api/auth/login').send(dummyUsers.admin);
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('admin');
  });
  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'student', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
  it('returns 401 for non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'nobody', password: 'x' });
    expect(res.statusCode).toBe(401);
  });
  it('returns 400 when username missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'student123' });
    expect(res.statusCode).toBe(400);
  });
  it('returns 400 when password missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'student' });
    expect(res.statusCode).toBe(400);
  });
  it('error message is the same for wrong user vs wrong password', async () => {
    const r1 = await request(app).post('/api/auth/login').send({ username: 'nobody', password: 'x' });
    const r2 = await request(app).post('/api/auth/login').send({ username: 'student', password: 'x' });
    expect(r1.body.error).toBe(r2.body.error);
  });
});

describe('POST /api/auth/verify', () => {
  it('returns valid true for a good token', async () => {
    const res = await request(app).post('/api/auth/verify').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(true);
  });
  it('returns 401 with no token', async () => {
    const res = await request(app).post('/api/auth/verify');
    expect(res.statusCode).toBe(401);
  });
  it('returns 401 for invalid tokens', async () => {
    for (const token of dummyInvalidTokens.filter(t => t)) {
      const res = await request(app).post('/api/auth/verify').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(401);
    }
  });
});
