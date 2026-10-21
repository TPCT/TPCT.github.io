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
    update(next);
    try { localStorage.setItem('theme', next); } catch {}
  });
})();
