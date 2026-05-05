// Dummy database helper - builds a fresh in-memory app for each test suite
// so tests never interfere with each other

const express = require('express');
const cors    = require('cors');

function buildTestApp(routes = []) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  routes.forEach(({ path, router }) => app.use(path, router));
  return app;
}

module.exports = { buildTestApp };
