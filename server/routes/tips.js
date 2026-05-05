const express = require('express');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const db      = require('../db');
const SECRET  = process.env.JWT_SECRET || 'uni-energy-secret-key';

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid or expired token' }); }
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM tips ORDER BY saving_kwh DESC').all());
});

router.post('/', requireAdmin, (req, res) => {
  const { title, description, saving_kwh, category } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });
  const result = db.prepare('INSERT INTO tips (title, description, saving_kwh, category) VALUES (?, ?, ?, ?)').run(title, description, saving_kwh || null, category || null);
  res.status(201).json(db.prepare('SELECT * FROM tips WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', requireAdmin, (req, res) => {
  const { title, description, saving_kwh, category } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });
  if (!db.prepare('SELECT * FROM tips WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Tip not found' });
  db.prepare('UPDATE tips SET title=?, description=?, saving_kwh=?, category=? WHERE id=?').run(title, description, saving_kwh || null, category || null, req.params.id);
  res.json(db.prepare('SELECT * FROM tips WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAdmin, (req, res) => {
  if (!db.prepare('SELECT * FROM tips WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Tip not found' });
  db.prepare('DELETE FROM tips WHERE id = ?').run(req.params.id);
  res.json({ message: 'Tip deleted successfully' });
});

module.exports = router;
