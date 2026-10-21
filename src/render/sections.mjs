import { esc, attr, slugify, sortProjects, externalAttrs, projectPath } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

const navLabel = (c, id) => c.site.nav.find(n => n.href === `#${id}`).label;
function section(id, index, short, title, body, data = '') {
  return `<section id="${id}" tabindex="-1" aria-labelledby="${id}-title"${data}><div class="container"><header class="section-head" data-reveal><p class="section-head__index" aria-hidden="true">${index} / ${esc(short)}</p><h2 id="${id}-title">${esc(title)}</h2></header>${body}</div></section>`;
}
const tags = (items, label) => `<ul class="tags"${label ? ` aria-label="${attr(label)}"` : ''}>${items.map(s => `<li class="tag">${esc(s)}</li>`).join('')}</ul>`;
function external(url, label, className = '', newTab = '', me = false) {
  return `<a href="${attr(url)}"${className ? ` class="${className}"` : ''} ${externalAttrs({ me })}>${esc(label)}${icon('arrow-up-right')}<span class="vh"> ${esc(newTab)}</span></a>`;
}
export function renderAbout(c) {
  const lead = c.about.lead.map((line, i) => `<span class="about__line${i === 1 ? ' about__line--accent' : ''}"><span>${esc(line)}</span></span>`).join(' ');
  const pillars = c.about.pillars.map((p, i) => `<li class="pillar"><span class="pillar__icon">${icon(p.icon, 24)}</span><span class="pillar__index" aria-hidden="true">${esc(String(i + 1).padStart(2, '0'))}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('');
  const companies = c.about.companies.map(name => `<li>${esc(name)}</li>`).join('');
  return section('about', '01', navLabel(c, 'about'), c.about.title, `<div class="about"><p class="about__lead" data-reveal>${lead}</p><p class="about__intro" data-reveal>${esc(c.about.intro)}</p><ul class="pillars" aria-label="${attr(c.about.pillarsLabel)}" data-reveal>${pillars}</ul><div class="clients" data-reveal><p class="label" id="clients-label">${esc(c.about.companiesLabel)}</p><div class="clients__rail"><ul class="clients__list" aria-labelledby="clients-label">${companies}</ul><ul class="clients__list clients__list--dup" aria-hidden="true">${companies}</ul></div></div></div>`);
}
export function renderTimeline(c) {
  const intro = c.timelineIntro;
  const items = c.timeline.map((item, i) => {
    const year = String(item.year), same = i > 0 && year === String(c.timeline[i - 1].year);
    const link = typeof item.link === 'string' ? { href: item.link, label: intro.linkLabel } : item.link;
    return `<li class="tl__item tl__item--${attr(item.kind)}${same ? ' tl__item--same-year' : ''}"><span class="tl__node" aria-hidden="true"></span><time class="tl__year${same ? ' vh' : ''}"${/^\d{4}$/.test(year) ? ` datetime="${attr(year)}"` : ''}>${esc(year)}</time><article class="tl__card" aria-labelledby="tl-${i}" data-reveal><p class="tl__meta"><span class="tl__kind">${esc(intro.kindLabels[item.kind])}</span></p><h3 id="tl-${i}">${esc(item.title)}</h3><p class="tl__text">${esc(item.text)}</p>${link ? `<p class="tl__more">${external(link.href, link.label, 'text-link', c.a11y.newTab)}</p>` : ''}</article></li>`;
  }).join('');
  return section('timeline', '02', c.sections.timeline, intro.title, `<p class="lead tl__lead" data-reveal>${esc(intro.lead)}</p><div class="tl"><span class="tl__spark" aria-hidden="true"></span><ol class="timeline">${items}</ol></div>`);
}
export function renderSkills(c) {
  const items = [...new Set(c.skills.flatMap(s => s.items))];
  const row = (name, parity) => {
    const list = `<ul class="marquee__list">${items.filter((_, i) => i % 2 === parity).map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
    return `<div class="marquee__row marquee__row--${name}">${list}${list}</div>`;
  };
  const marquee = `<div class="marquee" aria-hidden="true">${row('a', 0)}${row('b', 1)}</div>`;
  return section('skills', '03', navLabel(c, 'skills'), c.sections.skills, marquee + `<div class="skills">${c.skills.map((s, i) => `<div class="skill-group" data-reveal><div class="skill-group__head"><span aria-hidden="true">S${i + 1}</span><h3>${esc(s.group)}</h3></div>${tags(s.items)}</div>`).join('')}</div>`);
}
export function renderCard(p, c) {
  const s = c.projectsIntro;
  const privateWork = p.kind === 'case-study';
  return `<li class="card card--${attr(p.kind)}" data-category="${attr(slugify(p.category))}" data-kind="${attr(p.kind)}" data-featured="${attr(p.featured)}" data-reveal><article aria-labelledby="p-${attr(p.id)}"><p class="card__meta"><span class="badge">${icon(privateWork ? 'lock' : 'git-branch', 12)}${esc(s.kindLabels[p.kind])}</span><span>${esc(p.category)}</span>${p.year === undefined ? '' : `<span class="card__year">${esc(p.year)}</span>`}</p><h3 id="p-${attr(p.id)}">${esc(p.name)}</h3><p class="card__summary">${esc(p.summary)}</p><ul class="card__highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>${tags(p.stack, s.stackLabel)}<footer class="card__foot"><p class="card__role"><span class="label">${esc(s.roleLabel)}</span> ${esc(p.role)}</p><div class="card__actions"><a class="card__more" href="${attr(projectPath(p))}">${esc(privateWork ? c.projectPage.caseStudyLink : c.projectPage.openSourceLink)}<span class="vh">: ${esc(p.name)}</span>${icon('arrow-right', 16)}</a>${privateWork ? `<p class="card__private">${icon('lock', 16)}<span title="${attr(s.privateNote)}">${esc(s.privateNote)}</span></p>` : `<a class="card__repo" href="${attr(p.repoUrl)}" ${externalAttrs()}>${icon('git-branch', 16)}${esc(s.repoLinkLabel)}<span class="vh"> : ${esc(p.name)} ${esc(c.a11y.newTab)}</span>${icon('arrow-up-right', 16)}</a>`}</div></footer></article></li>`;
}
function chip(dimension, value, label, count) {
  return `<button type="button" class="chip" aria-pressed="${value === 'all'}" data-${dimension}="${attr(value)}"><span class="chip__label">${esc(label)}</span><span class="chip__count">${count}</span></button>`;
}
export function renderWork(c) {
  const s = c.projectsIntro, projects = sortProjects(c.projects), n = projects.length;
  const categoryChips = c.categories.map(category => {
    const count = projects.filter(p => p.category === category).length;
    return count ? chip('category', slugify(category), category, count) : '';
  }).join('');
  const kinds = ['case-study', 'open-source'];
  const kindGroup = kinds.every(kind => projects.some(p => p.kind === kind)) ? `<div role="group" aria-labelledby="f-kind-label"><p id="f-kind-label" class="label">${esc(s.kindFilterLabel)}</p>${chip('kind', 'all', s.allLabel, n)}${kinds.map(kind => chip('kind', kind, s.kindLabels[kind], projects.filter(p => p.kind === kind).length)).join('')}</div>` : '';
  return section('work', '04', navLabel(c, 'work'), s.title, `<p class="lead">${esc(s.lead)}</p><div class="filters" hidden data-reveal><div role="group" aria-labelledby="f-cat-label"><p id="f-cat-label" class="label">${esc(s.filterLabel)}</p>${chip('category', 'all', s.allLabel, n)}${categoryChips}</div>${kindGroup}<p id="work-count" class="label" role="status" aria-live="polite" aria-atomic="true">${n} ${esc(n === 1 ? s.countSingular : s.countPlural)}</p></div><ul class="projects" id="project-list">${projects.map(p => renderCard(p, c)).join('')}</ul><div class="projects-empty" hidden><p>${esc(s.emptyState)}</p><button type="button" class="btn btn--secondary">${esc(s.resetLabel)}</button></div>`, ` data-count-singular="${attr(s.countSingular)}" data-count-plural="${attr(s.countPlural)}"`);
}
export function renderServices(c) {
  return section('services', '05', c.sections.services, c.sections.services, `<ul class="services">${c.services.map((s, i) => `<li data-reveal><span class="services__index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></li>`).join('')}</ul>`);
}
export function renderProcess(c) {
  return section('process', '06', c.sections.process, c.sections.process, `<ol class="process" data-reveal>${c.process.map(p => `<li><h3>${esc(p.step)}</h3><p>${esc(p.desc)}</p></li>`).join('')}</ol>`);
}
export function renderContact(c) {
  const s = c.contact;
  const social = (key, glyph, me = false) => `<li><a class="btn btn--ghost" href="${attr(s[key])}" ${externalAttrs({ me })}>${icon(glyph, 16)}${esc(s[`${key}Label`])}${icon('arrow-up-right', 16)}<span class="vh"> ${esc(c.a11y.newTab)}</span></a></li>`;
  return section('contact', '07', navLabel(c, 'contact'), s.title, `<p class="lead" data-reveal>${esc(s.lead)}</p><div class="contact__email-card" data-reveal><p class="label" id="email-label">${esc(s.emailLabel)}</p><a class="contact__email" href="mailto:${attr(s.email)}" aria-describedby="email-label">${esc(s.email.split('@')[0])}<wbr><span class="email__domain">@${esc(s.email.split('@')[1])}</span></a><div class="contact__actions"><button type="button" class="btn btn--secondary copy-btn" hidden data-label-copy="${attr(s.copyLabel)}" data-label-copied="${attr(s.copiedLabel)}">${icon('copy')}${icon('check')}<span>${esc(s.copyLabel)}</span></button><a class="btn btn--ghost" href="mailto:${attr(s.email)}">${icon('mail', 18)}${esc(s.mailAppLabel)}</a></div></div><span class="vh" role="status" aria-live="polite" id="copy-status"></span><ul class="contact__links" data-reveal>${social('linkedin', 'linkedin', true)}${social('github', 'git-branch', true)}${social('website', 'globe')}</ul><p class="contact__location">${esc(s.location)}</p>`);
}
