document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('error-msg');
  const btn      = document.getElementById('login-btn');

  if (!username || !password) {
    errorEl.textContent = 'Please enter your username and password.';
    errorEl.style.display = 'block';
    return;
  }

  btn.textContent = 'Signing in...';
  btn.disabled    = true;
  errorEl.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    saveUser(data);
    window.location.href = '/dashboard.html';
  } catch (err) {
    errorEl.textContent   = err.message;
    errorEl.style.display = 'block';
    btn.textContent       = 'Sign In';
    btn.disabled          = false;
  }
});
