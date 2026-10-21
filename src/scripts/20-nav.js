(function () {
  "use strict";
  const nav = document.getElementById('primary-nav');
  const button = document.querySelector('.menu-btn');
  if (!nav || !button) return;
  const header = button.closest('.site-header');
  const desktop = window.matchMedia('(min-width: 768px)');
  function close(restoreFocus) {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', button.dataset.labelOpen);
    nav.hidden = !desktop.matches;
    if (restoreFocus) button.focus();
  }
  function resize() { button.hidden = desktop.matches; close(false); }
  resize();
  header.setAttribute('data-nav-ready', '');
  desktop.addEventListener('change', resize);
  button.addEventListener('click', function () {
    if (button.getAttribute('aria-expanded') === 'true') return close(false);
    nav.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', button.dataset.labelClose);
    nav.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') close(true);
  });
  document.addEventListener('click', function (e) { if (button.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) close(false); });
  header.addEventListener('focusout', function (e) {
    if (button.getAttribute('aria-expanded') !== 'true') return;
    const to = e.relatedTarget;
    if (to && !nav.contains(to) && to !== button) close(false);
  });
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    let id;
    try { id = decodeURIComponent(link.getAttribute('href').slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    if (nav.contains(link)) close(false);
    requestAnimationFrame(function () { target.focus({ preventScroll: true }); });
  });
})();
