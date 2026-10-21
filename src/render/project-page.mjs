import { esc, attr, projectPath } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { projectGraph } from '../lib/schema.mjs';
import { renderHead } from './head.mjs';
import { renderHeader } from './header.mjs';
import { renderFooter } from './footer.mjs';
import { renderPage } from './layout.mjs';

export function projectTitle(c, p) {
  const title = `${p.name} — ${c.projectsIntro.kindLabels[p.kind]} | ${c.site.shortTitle}`;
  return title.length <= 65 ? title : `${p.name} | ${c.site.shortTitle}`;
}
export function projectDescription(p) {
  if (p.summary.length <= 160) return p.summary;
  let cut = p.summary.slice(0, 159);
  if (cut.lastIndexOf(' ') >= 0) cut = cut.slice(0, cut.lastIndexOf(' '));
  return cut.replace(/[\s,;:.–—-]+$/, '') + '…';
}
export function renderProjectPage(c, p, { assets, prev = null, next = null }) {
  const pp = c.projectPage, s = c.projectsIntro, privateWork = p.kind === 'case-study';
  const title = projectTitle(c, p), description = projectDescription(p), url = new URL(projectPath(p), c.site.url).href;
  const head = renderHead(c, { page: 'project', title, description, path: projectPath(p), ogType: 'article', jsonLd: projectGraph(c, p, { url, title, description }), assets });
  const fact = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  const neighbour = (project, direction, label) => project ? `<a class="project__${direction}" rel="${direction}" href="${attr(projectPath(project))}"><span class="label">${esc(label)}</span> ${esc(project.name)}</a>` : '';
  const main = `<article class="project" aria-labelledby="project-title"><div class="container project__wrap">
<nav class="crumbs" aria-label="${attr(pp.breadcrumbLabel)}"><ol><li><a href="/">${esc(pp.homeLabel)}</a></li><li><a href="/#work">${esc(pp.workLabel)}</a></li><li aria-current="page">${esc(p.name)}</li></ol></nav>
<header class="project__head"><p class="card__meta"><span class="badge">${icon(privateWork ? 'lock' : 'git-branch', 12)}${esc(s.kindLabels[p.kind])}</span><span>${esc(p.category)}</span>${p.year === undefined ? '' : `<span class="card__year">${esc(p.year)}</span>`}</p><h1 id="project-title">${esc(p.name)}</h1><p class="lead project__summary">${esc(p.summary)}</p></header>
<dl class="project__facts">${fact(s.roleLabel, p.role)}${p.year === undefined ? '' : fact(pp.yearLabel, p.year)}${fact(pp.typeLabel, s.kindLabels[p.kind])}${fact(pp.categoryLabel, p.category)}</dl>
<section class="project__block" aria-labelledby="project-hl"><h2 id="project-hl">${esc(pp.highlightsTitle)}</h2><ul class="project__highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul></section>
<section class="project__block" aria-labelledby="project-stack"><h2 id="project-stack">${esc(pp.stackTitle)}</h2><ul class="tags" aria-label="${attr(s.stackLabel)}">${p.stack.map(x => `<li class="tag">${esc(x)}</li>`).join('')}</ul></section>
${privateWork ? `<p class="card__private">${icon('lock', 16)}${esc(s.privateNote)}</p>` : `<p class="project__cta"><a class="btn btn--primary" href="${attr(p.repoUrl)}" target="_blank" rel="noopener noreferrer">${icon('git-branch', 18)}${esc(s.repoLinkLabel)}<span class="vh"> : ${esc(p.name)} ${esc(c.a11y.newTab)}</span>${icon('arrow-up-right', 16)}</a></p>`}
<nav class="project__pager" aria-label="${attr(pp.pagerLabel)}">${neighbour(prev, 'prev', pp.prevLabel)}${neighbour(next, 'next', pp.nextLabel)}</nav>
<a class="text-link project__back" href="/#work">${esc(pp.backLabel)}</a></div></article>`;
  return renderPage(c, { head, header: renderHeader(c, { home: false }), main, footer: renderFooter(c) });
}
