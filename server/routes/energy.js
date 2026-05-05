const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/rooms', (req, res) => {
  const rooms = db.prepare(`
    SELECT r.*,
      (SELECT kwh FROM energy_readings WHERE room_id = r.id ORDER BY recorded_at DESC LIMIT 1) as latest_kwh,
      (SELECT AVG(kwh) FROM energy_readings WHERE room_id = r.id AND recorded_at >= datetime('now','-7 days')) as weekly_avg
    FROM rooms r ORDER BY r.floor, r.name
  `).all();
  res.json(rooms);
});

router.get('/rooms/:id/readings', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  res.json(db.prepare(`
    SELECT * FROM energy_readings
    WHERE room_id = ? AND recorded_at >= datetime('now','-'||?||' days')
    ORDER BY recorded_at ASC
  `).all(req.params.id, days));
});

router.post('/rooms/:id/readings', (req, res) => {
  const { kwh } = req.body;
  if (!kwh || isNaN(kwh) || kwh < 0) return res.status(400).json({ error: 'Invalid kWh value' });
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const result = db.prepare("INSERT INTO energy_readings (room_id, kwh, source) VALUES (?, ?, 'manual')").run(req.params.id, parseFloat(kwh));
  res.status(201).json({ id: result.lastInsertRowid, room_id: req.params.id, kwh });
});

router.get('/daily', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  res.json(db.prepare(`
    SELECT date(recorded_at) as date, ROUND(SUM(kwh),2) as total_kwh, COUNT(DISTINCT room_id) as active_rooms
    FROM energy_readings WHERE recorded_at >= datetime('now','-'||?||' days')
    GROUP BY date(recorded_at) ORDER BY date ASC
  `).all(days));
});

router.get('/summary', (req, res) => {
  const today     = db.prepare("SELECT ROUND(SUM(kwh),2) as total FROM energy_readings WHERE date(recorded_at)=date('now')").get();
  const yesterday = db.prepare("SELECT ROUND(SUM(kwh),2) as total FROM energy_readings WHERE date(recorded_at)=date('now','-1 day')").get();
  const week      = db.prepare("SELECT ROUND(AVG(dt),2) as avg FROM (SELECT SUM(kwh) as dt FROM energy_readings WHERE recorded_at>=datetime('now','-7 days') GROUP BY date(recorded_at))").get();
  const topRoom   = db.prepare("SELECT r.name, ROUND(SUM(e.kwh),2) as total FROM energy_readings e JOIN rooms r ON r.id=e.room_id WHERE e.recorded_at>=datetime('now','-7 days') GROUP BY e.room_id ORDER BY total DESC LIMIT 1").get();
  const t = today?.total || 0, y = yesterday?.total || 0;
  res.json({ today_kwh: t, yesterday_kwh: y, change_percent: y > 0 ? parseFloat(((t-y)/y*100).toFixed(1)) : 0, weekly_avg_kwh: week?.avg || 0, top_room: topRoom || null });
});

router.get('/contributions', (req, res) => {
  res.json(db.prepare(`
    SELECT r.name, r.floor, ROUND(SUM(e.kwh),2) as total_kwh
    FROM energy_readings e JOIN rooms r ON r.id=e.room_id
    WHERE e.recorded_at >= datetime('now','-7 days')
    GROUP BY e.room_id ORDER BY total_kwh DESC
  `).all());
});

module.exports = router;
