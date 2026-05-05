// Sets up the nav bar on all pages after login
(function () {
  const user    = getUser();
  const nameEl  = document.getElementById('nav-username');
  const logoutEl = document.getElementById('nav-logout');
  if (nameEl)   nameEl.textContent  = user?.username || '';
  if (logoutEl) logoutEl.addEventListener('click', logout);

  // Highlight active nav link
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    if (link.getAttribute('href') === window.location.pathname.split('/').pop()) {
      link.classList.add('active');
    }
  });
})();
