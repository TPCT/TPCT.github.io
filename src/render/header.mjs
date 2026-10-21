import { logoMark } from '../lib/logo.mjs';
import { esc, attr } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
export function renderHeader(c, { home = true } = {}) {
  const s = c.site;
  return `<header class="site-header"><div class="container header-inner"><a href="${home ? '#top' : '/'}" class="brand">${logoMark({ idPrefix: 'hdr', className: 'brand__mark' })}${esc(s.shortTitle)}</a>${home ? `<nav id="primary-nav" aria-label="Primary"><ul>${s.nav.map(n => `<li><a href="${attr(n.href)}">${esc(n.label)}</a></li>`).join('')}</ul></nav>` : ''}<button type="button" class="icon-btn theme-toggle" hidden aria-label="${attr(s.themeToggle.toLight)}" title="${attr(s.themeToggle.toLight)}" data-label-dark="${attr(s.themeToggle.toDark)}" data-label-light="${attr(s.themeToggle.toLight)}" data-color-dark="${attr(s.themeColorDark)}" data-color-light="${attr(s.themeColorLight)}">${icon('sun')}${icon('moon')}</button>${home ? `<button type="button" class="icon-btn menu-btn" aria-expanded="false" aria-controls="primary-nav" aria-label="${attr(s.menuOpen)}" data-label-open="${attr(s.menuOpen)}" data-label-close="${attr(s.menuClose)}" hidden>${icon('menu')}${icon('x')}</button>` : ''}</div></header>`;
}
