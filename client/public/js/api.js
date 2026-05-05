// Shared API helper used by all pages

function getToken()  { return localStorage.getItem('token'); }
function getUser()   { return JSON.parse(localStorage.getItem('user') || 'null'); }
function saveUser(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role, token: data.token }));
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { logout(); return; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
