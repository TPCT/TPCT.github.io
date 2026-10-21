(function () {
  "use strict";
  if (!('IntersectionObserver' in window)) return;
  const nav = document.getElementById('primary-nav');
  if (!nav) return;
  const mapping = { about: 'about', experience: 'about', skills: 'skills', work: 'work', services: 'services', process: 'services', contact: 'contact' };
  const links = Array.from(nav.querySelectorAll('a'));
  const ids = Array.from(document.querySelectorAll('section[id]')).map(section => section.id).filter(id => id === 'top' || Object.hasOwn(mapping, id));
  const active = new Set();
  const observer = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) active.add(entry.target.id);
      else active.delete(entry.target.id);
    }
    const id = ids.filter(id => active.has(id)).at(-1);
    for (const link of links) {
      if (mapping[id] && link.getAttribute('href') === '#' + mapping[id]) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  for (const id of ids) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
})();
