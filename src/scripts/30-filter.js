(function () {
  "use strict";
  const root = document.getElementById('work');
  if (!root) return;
  const filters = root.querySelector('.filters');
  const grid = root.querySelector('#project-list');
  const empty = root.querySelector('.projects-empty');
  const count = root.querySelector('#work-count');
  if (!filters || !grid || !empty || !count) return;
  const cards = Array.from(grid.children);
  const chips = Array.from(filters.querySelectorAll('.chip'));
  const state = { category: 'all', kind: 'all' };
  const params = new URLSearchParams(window.location.search);
  for (const dimension of ['category', 'kind']) {
    const value = params.get(dimension);
    if (chips.some(chip => chip.dataset[dimension] === value)) state[dimension] = value;
  }
  let announcement, releaseHeight;
  function canonicalize() {
    const query = new URLSearchParams();
    for (const dimension of ['category', 'kind']) if (state[dimension] !== 'all') query.set(dimension, state[dimension]);
    const qs = query.toString();
    try { history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + '#work'); } catch { /* URL state is optional in restricted contexts. */ }
  }
  function matches(card, dimension, value) { return value === 'all' || card.dataset[dimension] === value; }
  function render(updateUrl) {
    clearTimeout(releaseHeight);
    const row = cards.find(card => !card.hidden);
    if (row) grid.style.minHeight = row.getBoundingClientRect().height + 'px';
    let visible = 0;
    for (const card of cards) {
      const show = matches(card, 'category', state.category) && matches(card, 'kind', state.kind);
      const entering = card.hidden && show;
      card.hidden = !show;
      card.classList.toggle('is-entering', entering);
      if (show) visible++;
    }
    grid.hidden = visible === 0;
    empty.hidden = visible !== 0;
    for (const chip of chips) {
      const dimension = chip.hasAttribute('data-category') ? 'category' : 'kind';
      const other = dimension === 'category' ? 'kind' : 'category';
      const n = cards.filter(card => matches(card, dimension, chip.dataset[dimension]) && matches(card, other, state[other])).length;
      chip.setAttribute('aria-pressed', String(state[dimension] === chip.dataset[dimension]));
      chip.querySelector('.chip__count').textContent = n;
      chip.classList.toggle('chip--zero', n === 0);
    }
    cancelAnimationFrame(announcement);
    count.textContent = '';
    announcement = requestAnimationFrame(function () { count.textContent = visible + ' ' + (visible === 1 ? root.dataset.countSingular : root.dataset.countPlural); });
    releaseHeight = setTimeout(function () { grid.style.minHeight = ''; }, 200);
    if (updateUrl) canonicalize();
  }
  for (const card of cards) card.addEventListener('animationend', function () { card.classList.remove('is-entering'); });
  filters.addEventListener('click', function (event) {
    const chip = event.target.closest('.chip');
    if (!chip || !filters.contains(chip) || chip.getAttribute('aria-pressed') === 'true') return;
    const dimension = chip.hasAttribute('data-category') ? 'category' : 'kind';
    state[dimension] = chip.dataset[dimension];
    render(true);
  });
  empty.querySelector('button').addEventListener('click', function () {
    state.category = state.kind = 'all';
    render(true);
    filters.querySelector('[data-category="all"]').focus({ preventScroll: true });
  });
  filters.hidden = false;
  render(params.has('category') || params.has('kind'));
})();
