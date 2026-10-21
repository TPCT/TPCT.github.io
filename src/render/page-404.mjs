import { logoMark } from '../lib/logo.mjs';
import { esc } from '../lib/html.mjs';
import { renderHead } from './head.mjs';
import { renderHeader } from './header.mjs';
import { renderFooter } from './footer.mjs';
import { renderPage } from './layout.mjs';
export function render404(c, { assets }) {
  const n = c.notFound;
  return renderPage(c, { head: renderHead(c, { page: '404', title: `${n.code} — ${n.title} · ${c.site.shortTitle}`, description: c.site.description, assets }), header: renderHeader(c, { home: false }), main: `<div class="container nf"><p class="nf__code">${esc(n.code)}</p><h1>${esc(n.title)}</h1><p class="nf__message">${esc(n.message)}</p><a class="btn btn--primary" href="/">${esc(n.cta.label)}</a><div class="nf__schematic" aria-hidden="true">${logoMark({ idPrefix: 'nf', className: 'nf__mark' })}</div></div>`, footer: renderFooter(c) });
}
