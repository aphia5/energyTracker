let roomChart;
let allRooms = [];

async function loadRooms() {
  try {
    allRooms = await apiFetch('/energy/rooms');
    renderRoomList();
    if (allRooms.length) selectRoom(allRooms[0]);
  } catch (err) { console.error('Rooms load error:', err); }
}

function renderRoomList() {
  const list = document.getElementById('room-list');
  list.innerHTML = allRooms.map(room => {
    const pct   = Math.min(100, ((room.latest_kwh || 0) / 6) * 100);
    const color = pct > 75 ? '#dc2626' : pct > 45 ? '#d97706' : '#16a34a';
    return `
      <div class="room-card" onclick="selectRoom(${JSON.stringify(room).replace(/"/g,'&quot;')})" id="room-${room.id}">
        <div class="room-card-top">
          <div>
            <div class="room-name">${room.name}</div>
            <div class="room-meta">Floor ${room.floor} · ${room.occupants || 0} occupants</div>
          </div>
          <div class="room-kwh" style="color:${color}">${room.latest_kwh ?? '—'} <span class="room-kwh-label">kWh</span></div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>
      </div>`;
  }).join('');
}

async function selectRoom(room) {
  document.querySelectorAll('.room-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById('room-' + room.id);
  if (card) card.classList.add('selected');

  document.getElementById('detail-name').textContent   = room.name;
  document.getElementById('detail-floor').textContent  = room.floor;
  document.getElementById('detail-occ').textContent    = room.occupants || 0;
  document.getElementById('detail-kwh').textContent    = (room.latest_kwh ?? '—') + ' kWh';
  document.getElementById('detail-avg').textContent    = room.weekly_avg ? parseFloat(room.weekly_avg).toFixed(2) + ' kWh/day' : '—';

  try {
    const readings = await apiFetch('/energy/rooms/' + room.id + '/readings?days=14');
    const ctx = document.getElementById('room-chart').getContext('2d');
    if (roomChart) roomChart.destroy();
    roomChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: readings.map(r => r.recorded_at.slice(5,10)),
        datasets: [{ label: 'kWh', data: readings.map(r => r.kwh), borderColor: '#1a56db', backgroundColor: 'rgba(26,86,219,0.08)', fill: true, tension: 0.3 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  } catch (err) { console.error('Room readings error:', err); }
}

loadRooms();
