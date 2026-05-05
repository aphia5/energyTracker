const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');
const fs       = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'energy.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL,
    role     TEXT    DEFAULT 'student'
  );
  CREATE TABLE IF NOT EXISTS rooms (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    floor     INTEGER NOT NULL,
    occupants INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS energy_readings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id     INTEGER NOT NULL,
    kwh         REAL    NOT NULL,
    source      TEXT    DEFAULT 'manual',
    recorded_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );
  CREATE TABLE IF NOT EXISTS tips (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    saving_kwh  REAL,
    category    TEXT
  );
`);

const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (userCount.c === 0) {
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('student', bcrypt.hashSync('student123', 10), 'student');
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', bcrypt.hashSync('admin123', 10), 'admin');
}

const roomCount = db.prepare('SELECT COUNT(*) as c FROM rooms').get();
if (roomCount.c === 0) {
  const insertRoom = db.prepare('INSERT INTO rooms (name, floor, occupants) VALUES (?, ?, ?)');
  [
    ['Student Hall A', 1, 4], ['Student Hall B', 1, 3], ['Student Hall C', 1, 2],
    ['Student Hall D', 2, 4], ['Student Hall E', 2, 3], ['Student Hall F', 2, 2],
    ['Postgrad Block A', 3, 2], ['Postgrad Block B', 3, 1],
    ['Common Room', 1, 0], ['Study Lounge', 2, 0],
  ].forEach(r => insertRoom.run(...r));

  const insertReading = db.prepare("INSERT INTO energy_readings (room_id, kwh, source, recorded_at) VALUES (?, ?, ?, ?)");
  db.transaction(() => {
    for (let roomId = 1; roomId <= 10; roomId++) {
      for (let day = 29; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const base = roomId <= 8 ? (1.2 + Math.random() * 2.8) : (3.5 + Math.random() * 4);
        insertReading.run(roomId, parseFloat(base.toFixed(2)), 'iot', date.toISOString().replace('T',' ').slice(0,19));
      }
    }
  })();

  const insertTip = db.prepare('INSERT INTO tips (title, description, saving_kwh, category) VALUES (?, ?, ?, ?)');
  [
    ['Turn Off Lights When You Leave', 'Get into the habit of switching lights off every time you leave your room.', 0.3, 'lighting'],
    ['Bleed Your Radiator', 'If your radiator is cold at the top it needs bleeding. A properly working radiator uses up to 15% less energy.', 1.1, 'heating'],
    ['Do One Big Wash a Week', 'Collect your laundry and do one full load per week instead of small washes every few days.', 0.7, 'appliances'],
    ['Unplug Chargers Overnight', 'Chargers left plugged in all night still draw power even when nothing is connected.', 0.2, 'appliances'],
    ['Use the Common Room for Studying', 'Shared spaces split the heating and lighting cost across everyone in the building.', 0.9, 'heating'],
    ['Open Curtains in the Morning', 'Natural daylight can warm a small room on a sunny day before you touch the radiator.', 0.3, 'lighting'],
    ['Report Faults to Your RA', 'Dripping taps and broken radiator valves waste energy. Report them to maintenance quickly.', 0.8, 'appliances'],
    ['Shower in Under 5 Minutes', 'A university shower uses around 0.5 kWh every 5 minutes. Cutting it in half saves energy every day.', 1.3, 'heating'],
  ].forEach(t => insertTip.run(...t));
}

module.exports = db;
