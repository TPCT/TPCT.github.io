(function () {
  "use strict";
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  function update(theme) {
    root.dataset.theme = theme;
    const next = theme === 'dark' ? 'Light' : 'Dark';
    button.setAttribute('aria-label', button.dataset['label' + next]);
    button.title = button.dataset['label' + next];
    if (meta) meta.content = button.dataset[theme === 'dark' ? 'colorDark' : 'colorLight'];
  }
  update(root.dataset.theme);
  button.hidden = false;
  button.addEventListener('click', function () {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (typeof document.startViewTransition === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const r = button.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      root.style.setProperty('--vt-x', x + 'px'); root.style.setProperty('--vt-y', y + 'px');
      root.style.setProperty('--vt-r', Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 'px');
      document.startViewTransition(() => update(next));
    } else update(next);
    try { localStorage.setItem('theme', next); } catch {}
  });
})();
