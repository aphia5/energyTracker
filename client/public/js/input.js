async function loadRooms() {
  try {
    const rooms = await apiFetch('/energy/rooms');
    const select = document.getElementById('room-select');
    select.innerHTML = rooms.map(r => `<option value="${r.id}">${r.name} (Floor ${r.floor})</option>`).join('');
    updateRoomInfo(rooms[0]);
    select.addEventListener('change', () => {
      const room = rooms.find(r => String(r.id) === select.value);
      updateRoomInfo(room);
    });
  } catch (err) { console.error('Input load error:', err); }
}

function updateRoomInfo(room) {
  if (!room) return;
  document.getElementById('info-name').textContent  = room.name;
  document.getElementById('info-floor').textContent = room.floor;
  document.getElementById('info-occ').textContent   = room.occupants || 0;
  document.getElementById('info-kwh').textContent   = room.latest_kwh ? room.latest_kwh + ' kWh' : 'No data';
  document.getElementById('info-avg').textContent   = room.weekly_avg ? parseFloat(room.weekly_avg).toFixed(2) + ' kWh/day' : 'No data';
}

document.getElementById('reading-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const roomId  = document.getElementById('room-select').value;
  const kwh     = parseFloat(document.getElementById('kwh-input').value);
  const msgEl   = document.getElementById('submit-msg');
  const btn     = document.getElementById('submit-btn');

  if (!kwh || kwh <= 0) {
    showMsg(msgEl, 'Please enter a valid kWh value greater than 0.', 'error'); return;
  }

  btn.disabled = true; btn.textContent = 'Logging...';
  try {
    await apiFetch('/energy/rooms/' + roomId + '/readings', { method: 'POST', body: JSON.stringify({ kwh }) });
    showMsg(msgEl, 'Reading of ' + kwh + ' kWh logged successfully!', 'success');
    document.getElementById('kwh-input').value = '';
  } catch (err) {
    showMsg(msgEl, err.message || 'Failed to log reading.', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Log Reading';
  }
});

function showMsg(el, text, type) {
  el.textContent = text;
  el.className   = 'msg ' + type;
  el.style.display = 'block';
}

loadRooms();
