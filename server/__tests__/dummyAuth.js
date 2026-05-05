// Dummy auth data used across tests to keep things consistent

const dummyUsers = {
  student: { username: 'student', password: 'student123', role: 'student' },
  admin:   { username: 'admin',   password: 'admin123',   role: 'admin'   },
};

const dummyTokenPayload = {
  student: { id: 1, username: 'student', role: 'student' },
  admin:   { id: 2, username: 'admin',   role: 'admin'   },
};

const dummyInvalidTokens = [
  'faketoken123',
  'Bearer ',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bad.sig',
  '',
];

module.exports = { dummyUsers, dummyTokenPayload, dummyInvalidTokens };
