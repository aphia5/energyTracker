// Redirect to login if not authenticated
(function () {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
  }
})();
