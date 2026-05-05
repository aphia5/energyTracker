let allTips = [];
let currentFilter = 'all';
const user = getUser();

const CAT_COLORS = {
  lighting:   { color: '#d97706', icon: '💡' },
  appliances: { color: '#0369a1', icon: '🔌' },
  heating:    { color: '#dc2626', icon: '🔥' },
};

async function loadTips() {
  try {
    allTips = await apiFetch('/tips');
    renderTips();
    updateSummary();
  } catch (err) { console.error('Tips load error:', err); }
}

function updateSummary() {
  document.getElementById('tip-count').textContent    = allTips.length;
  const total = allTips.reduce((s, t) => s + (t.saving_kwh || 0), 0);
  document.getElementById('total-saving').textContent = total.toFixed(1);
  document.getElementById('co2-saving').textContent   = (total * 30 * 0.233).toFixed(1);
}

function renderTips() {
  const max      = Math.max(...allTips.map(t => t.saving_kwh || 0), 1);
  const filtered = currentFilter === 'all' ? allTips : allTips.filter(t => t.category === currentFilter);
  const grid     = document.getElementById('tips-grid');

  if (!filtered.length) { grid.innerHTML = '<p class="no-tips">No tips in this category.</p>'; return; }

  grid.innerHTML = filtered.map(tip => {
    const s   = CAT_COLORS[tip.category] || { color: '#1a56db', icon: '⚡' };
    const pct = Math.min(100, ((tip.saving_kwh || 0) / max) * 100);
    const adminBtns = user?.role === 'admin' ? `
      <div class="tip-admin-btns">
        <button class="btn-edit" onclick="editTip(${tip.id})">Edit</button>
        <button class="btn-delete" onclick="deleteTip(${tip.id})">Delete</button>
      </div>` : '';
    return `
      <div class="tip-card" style="border-left: 3px solid ${s.color}">
        <div class="tip-header">
          <span class="tip-icon">${s.icon}</span>
          <div class="tip-header-text">
            <div class="tip-title">${tip.title}</div>
            <span class="tip-cat" style="color:${s.color}">${tip.category || 'general'}</span>
          </div>
          ${adminBtns}
        </div>
        <p class="tip-desc">${tip.description}</p>
        ${tip.saving_kwh ? `
          <div class="tip-saving-row">
            <span>Potential saving</span>
            <span style="color:${s.color}">${tip.saving_kwh} kWh/day</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${s.color}"></div></div>` : ''}
      </div>`;
  }).join('');
}

function setFilter(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-' + cat).classList.add('active');
  renderTips();
}

async function deleteTip(id) {
  if (!confirm('Delete this tip?')) return;
  try {
    await apiFetch('/tips/' + id, { method: 'DELETE' });
    allTips = allTips.filter(t => t.id !== id);
    renderTips(); updateSummary();
  } catch (err) { alert(err.message); }
}

function editTip(id) {
  const tip = allTips.find(t => t.id === id);
  if (!tip) return;
  document.getElementById('form-id').value          = tip.id;
  document.getElementById('form-title').value       = tip.title;
  document.getElementById('form-desc').value        = tip.description;
  document.getElementById('form-saving').value      = tip.saving_kwh || '';
  document.getElementById('form-category').value    = tip.category || 'lighting';
  document.getElementById('form-heading').textContent = 'Edit Tip';
  document.getElementById('tip-form-section').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAddForm() {
  document.getElementById('form-id').value          = '';
  document.getElementById('form-title').value       = '';
  document.getElementById('form-desc').value        = '';
  document.getElementById('form-saving').value      = '';
  document.getElementById('form-category').value    = 'lighting';
  document.getElementById('form-heading').textContent = 'Add New Tip';
  document.getElementById('tip-form-section').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelForm() {
  document.getElementById('tip-form-section').style.display = 'none';
}

document.getElementById('tip-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id    = document.getElementById('form-id').value;
  const payload = {
    title:       document.getElementById('form-title').value.trim(),
    description: document.getElementById('form-desc').value.trim(),
    saving_kwh:  parseFloat(document.getElementById('form-saving').value) || null,
    category:    document.getElementById('form-category').value,
  };
  const errEl = document.getElementById('form-error');
  if (!payload.title || !payload.description) { errEl.textContent = 'Title and description are required.'; errEl.style.display='block'; return; }
  errEl.style.display = 'none';
  try {
    if (id) {
      await apiFetch('/tips/' + id, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch('/tips', { method: 'POST', body: JSON.stringify(payload) });
    }
    cancelForm();
    allTips = await apiFetch('/tips');
    renderTips(); updateSummary();
  } catch (err) { errEl.textContent = err.message; errEl.style.display = 'block'; }
});

// Show admin button if admin
if (user?.role === 'admin') {
  document.getElementById('admin-add-btn').style.display = 'inline-block';
  document.getElementById('admin-notice').style.display  = 'block';
}

loadTips();
