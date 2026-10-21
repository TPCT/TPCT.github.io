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
  let announcement, releaseHeight, pending, prevNext, ready = false;
  let leaving = [];
  function canonicalize() {
    const query = new URLSearchParams;
    for (const dimension of ['category', 'kind']) if (state[dimension] !== 'all') query.set(dimension, state[dimension]);
    const q = query.toString();
    try { history.replaceState(null, '', window.location.pathname + (q ? '?' + q : '') + '#work'); } catch {}
  }
  function matches(card, dimension, value) { return value === 'all' || card.dataset[dimension] === value; }
  function swap(next, animated) {
    pending = 0;
    clearTimeout(releaseHeight);
    const rects = new Map(cards.filter(card => !card.hidden).map(card => [card, animated ? card.getBoundingClientRect() : null]));
    leaving.forEach(leave => leave.cancel());
    leaving = [];
    let order = 0;
    cards.forEach((card, idx) => {
      const entering = !rects.has(card) && next[idx];
      card.hidden = !next[idx];
      card.classList.remove('is-pending');
      card.classList.toggle('is-entering', entering);
      card.style.removeProperty('--rd');
      if (entering && animated) card.style.setProperty('--rd', Math.min(order++, 8) * 35 + 'ms');
    });
    grid.hidden = !next.some(Boolean);
    empty.hidden = !grid.hidden;
    if (animated) rects.forEach((before, card) => {
      if (card.hidden) return;
      const after = card.getBoundingClientRect(), dx = before.left - after.left, dy = before.top - after.top;
      if (dx || dy) card.animate([{transform: `translate(${dx}px, ${dy}px)`}, {transform: 'none'}], {duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)'});
    });
    releaseHeight = setTimeout(() => { grid.style.minHeight = ''; }, animated ? 600 : 200);
  }
  function render(url) {
    if (pending) {
      clearTimeout(pending);
      swap(prevNext, true);
    }
    clearTimeout(releaseHeight);
    const row = cards.find(card => !card.hidden);
    if (row) grid.style.minHeight = row.getBoundingClientRect().height + 'px';
    const next = cards.map(card => matches(card, 'category', state.category) && matches(card, 'kind', state.kind));
    const visible = next.filter(Boolean).length;
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
    if (url) canonicalize();
    if (!ready || !document.documentElement.classList.contains('motion')) return swap(next, false);
    leaving = cards.filter((card, idx) => !card.hidden && !next[idx]).map(card => card.animate([{opacity: 1, scale: 1}, {opacity: 0, scale: .94}], {duration: 160, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}));
    prevNext = next;
    if (leaving.length) pending = setTimeout(() => swap(next, true), 160);
    else swap(next, true);
  }
  for (const card of cards) card.addEventListener('animationend', function () {
    card.classList.remove('is-entering');
    card.style.removeProperty('--rd');
  });
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
  ready = true;
})();
