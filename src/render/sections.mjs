import { esc, attr, slugify, sortProjects, externalAttrs } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

const navLabel = (c, id) => c.site.nav.find(n => n.href === `#${id}`).label;
function section(id, index, short, title, body, data = '') {
  return `<section id="${id}" tabindex="-1" aria-labelledby="${id}-title"${data}><div class="container"><header class="section-head" data-reveal><p class="section-head__index" aria-hidden="true">${index} / ${esc(short)}</p><h2 id="${id}-title">${esc(title)}</h2></header>${body}</div></section>`;
}
const tags = (items, label) => `<ul class="tags"${label ? ` aria-label="${attr(label)}"` : ''}>${items.map(s => `<li class="tag">${esc(s)}</li>`).join('')}</ul>`;
function external(url, label, className = '', newTab = '') {
  return `<a href="${attr(url)}"${className ? ` class="${className}"` : ''} ${externalAttrs()}>${esc(label)}${icon('arrow-up-right')}<span class="vh"> ${esc(newTab)}</span></a>`;
}
export function renderAbout(c) {
  return section('about', '01', navLabel(c, 'about'), c.about.title, `<div class="about__body" data-reveal>${c.about.paragraphs.map((p, i) => `<p${i === 0 ? ' class="lead"' : ''}>${esc(p)}</p>`).join('')}</div>`);
}
function careerDates(role, now) {
  const monthIndex = value => { const [year, month] = value.split('-').map(Number); return year * 12 + month - 1; };
  const time = value => {
    const [year, month] = value.split('-').map(Number);
    const label = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1)));
    return `<time datetime="${attr(value)}">${esc(label)}</time>`;
  };
  const months = Math.max(1, (role.end ? monthIndex(role.end) : now.getUTCFullYear() * 12 + now.getUTCMonth()) - monthIndex(role.start) + 1);
  const years = Math.floor(months / 12), rest = months % 12;
  const duration = [years ? `${years} ${years === 1 ? 'yr' : 'yrs'}` : '', rest ? `${rest} ${rest === 1 ? 'mo' : 'mos'}` : ''].filter(Boolean).join(' ');
  return `${time(role.start)} – ${role.end ? time(role.end) : 'Present'} · ${duration}`;
}
export function renderExperience(c, now = new Date()) {
  const company = e => `<li class="career__org" data-reveal><div class="career__head"><h3>${e.orgUrl ? external(e.orgUrl, e.org, 'text-link', c.a11y.newTab) : esc(e.org)}</h3><p class="career__meta">${esc(e.type)} · ${esc(e.location)}</p></div><ol class="career__roles">${e.roles.map(r => `<li class="career__role"><p class="career__title">${esc(r.title)}${r.end === null ? ' <span class="career__now">Now</span>' : ''}</p><p class="career__dates">${careerDates(r, now)}</p><ul class="career__points">${r.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul></li>`).join('')}</ol></li>`;
  const list = entries => `<ol class="career">${entries.map(company).join('')}</ol>`;
  return section('experience', '02', c.sections.experience, c.sections.experience, `${list(c.experience.slice(0, 6))}<details class="career__more"><summary>${esc(c.sections.experienceMoreLabel)}</summary>${list(c.experience.slice(6))}</details>`);
}
export function renderSkills(c) {
  return section('skills', '03', navLabel(c, 'skills'), c.sections.skills, `<div class="skills">${c.skills.map((s, i) => `<div class="skill-group" data-reveal><div class="skill-group__head"><span aria-hidden="true">S${i + 1}</span><h3>${esc(s.group)}</h3></div>${tags(s.items)}</div>`).join('')}</div>`);
}
export function renderCard(p, c) {
  const s = c.projectsIntro;
  const privateWork = p.kind === 'case-study';
  return `<li class="card card--${attr(p.kind)}" data-category="${attr(slugify(p.category))}" data-kind="${attr(p.kind)}" data-featured="${attr(p.featured)}" data-reveal><article aria-labelledby="p-${attr(p.id)}"><p class="card__meta"><span class="badge">${icon(privateWork ? 'lock' : 'git-branch', 12)}${esc(s.kindLabels[p.kind])}</span><span>${esc(p.category)}</span>${p.year === undefined ? '' : `<span class="card__year">${esc(p.year)}</span>`}</p><h3 id="p-${attr(p.id)}">${esc(p.name)}</h3><p class="card__summary">${esc(p.summary)}</p><ul class="card__highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>${tags(p.stack, s.stackLabel)}<footer class="card__foot"><p class="card__role"><span class="label">${esc(s.roleLabel)}</span> ${esc(p.role)}</p>${privateWork ? `<p class="card__private">${icon('lock', 16)}${esc(s.privateNote)}</p>` : `<a class="card__repo" href="${attr(p.repoUrl)}" ${externalAttrs()}>${icon('git-branch', 16)}${esc(s.repoLinkLabel)}<span class="vh"> : ${esc(p.name)} ${esc(c.a11y.newTab)}</span>${icon('arrow-up-right', 16)}</a>`}</footer></article></li>`;
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
  return section('contact', '07', navLabel(c, 'contact'), s.title, `<p class="lead" data-reveal>${esc(s.lead)}</p><p class="label" id="email-label">${esc(s.emailLabel)}</p><div class="contact__email-row" data-reveal><a class="contact__email" href="mailto:${attr(s.email)}" aria-describedby="email-label">${esc(s.email.split('@')[0])}<wbr><span class="email__domain">@${esc(s.email.split('@')[1])}</span></a><button type="button" class="btn btn--secondary copy-btn" hidden data-label-copy="${attr(s.copyLabel)}" data-label-copied="${attr(s.copiedLabel)}">${icon('copy')}${icon('check')}<span>${esc(s.copyLabel)}</span></button></div><span class="vh" role="status" aria-live="polite" id="copy-status"></span><ul class="contact__links" data-reveal><li>${external(s.website, s.websiteLabel, '', c.a11y.newTab)}</li><li>${external(s.github, s.githubLabel, '', c.a11y.newTab)}</li><li>${esc(s.location)}</li></ul>`);
}
