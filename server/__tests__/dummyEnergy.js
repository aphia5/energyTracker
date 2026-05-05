// Dummy energy reading data used in tests

const dummyReadings = [
  { room_id: 1, kwh: 2.5,  source: 'iot',    recorded_at: '2026-05-01 08:00:00' },
  { room_id: 1, kwh: 3.1,  source: 'iot',    recorded_at: '2026-05-02 08:00:00' },
  { room_id: 2, kwh: 1.8,  source: 'manual', recorded_at: '2026-05-01 09:00:00' },
  { room_id: 3, kwh: 4.2,  source: 'iot',    recorded_at: '2026-05-01 10:00:00' },
];

const dummyRooms = [
  { id: 1, name: 'Student Hall A', floor: 1, occupants: 4 },
  { id: 2, name: 'Student Hall B', floor: 1, occupants: 3 },
  { id: 3, name: 'Common Room',    floor: 1, occupants: 0 },
];

const validKwhValues   = [0.01, 1.5, 2.75, 10.0, 999.99];
const invalidKwhValues = [-1, 0, 'bad', null, '', undefined];

module.exports = { dummyReadings, dummyRooms, validKwhValues, invalidKwhValues };
