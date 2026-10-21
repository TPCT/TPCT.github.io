import { hasIcon } from './icons.mjs';

export function validateContent(c) {
  const errors = [], warnings = [];
  const object = (v, p) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) { errors.push(`${p}: required object`); return {}; }
    return v;
  };
  const strings = (v, keys, p) => {
    v = object(v, p);
    for (const k of keys.split(' ')) if (typeof v[k] !== 'string' || !v[k].trim()) errors.push(`${p}.${k}: required non-empty string`);
    return v;
  };
  const array = (v, p, nonempty = true) => {
    if (!Array.isArray(v)) { errors.push(`${p}: required array`); return []; }
    if (nonempty && !v.length) errors.push(`${p}: must not be empty`);
    return v;
  };
  const stringArray = (v, p) => array(v, p).forEach((s, i) => { if (typeof s !== 'string' || !s.trim()) errors.push(`${p}[${i}]: required non-empty string`); });
  c = object(c, 'content');
  const site = strings(c.site, 'title jobTitle alternateName shortTitle description url lang locale author ogImage ogImageAlt themeColorDark themeColorLight skipLink footer menuOpen menuClose', 'site');
  if (site.title?.length > 65) errors.push('site.title: must be ≤ 65 characters');
  if (site.description?.length > 160) errors.push('site.description: must be ≤ 160 characters');
  if (!/^https:\/\/www\.linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/.test(c.contact?.linkedin ?? '')) errors.push('contact.linkedin: expected https://www.linkedin.com/in/<handle>/');
  strings(site.themeToggle, 'toDark toLight', 'site.themeToggle');
  array(site.nav, 'site.nav').forEach((n, i) => {
    n = strings(n, 'label href', `site.nav[${i}]`);
    if (typeof n.href === 'string' && !n.href.startsWith('#')) errors.push(`site.nav[${i}].href: must start with #`);
  });
  const hero = strings(c.hero, 'eyebrow name headline subheadline location reach domainsLabel', 'hero');
  strings(hero.motionToggle, 'pause play', 'hero.motionToggle');
  for (const k of ['roles', 'domains']) stringArray(hero[k], `hero.${k}`);
  for (const k of ['ctaPrimary', 'ctaSecondary', 'ctaTertiary']) strings(hero[k], 'label href', `hero.${k}`);
  const protocol = (value, pattern, field) => { if (typeof value !== 'string' || !pattern.test(value)) errors.push(`${field}: invalid URL protocol`); };
  protocol(hero.ctaSecondary?.href, /^(?:#[^\s]+|mailto:)/, 'hero.ctaSecondary.href');
  protocol(hero.ctaTertiary?.href, /^https:\/\//, 'hero.ctaTertiary.href');
  for (const k of ['github', 'website', 'linkedin']) protocol(c.contact?.[k], /^https:\/\//, `contact.${k}`);
  const about = strings(c.about, 'title intro pillarsLabel companiesLabel', 'about');
  if (about.intro?.length > 200) errors.push('about.intro: must be ≤ 200 characters');
  if (!Array.isArray(about.lead) || about.lead.length !== 2 || about.lead.some(line => typeof line !== 'string' || !line.trim())) errors.push('about.lead: expected exactly 2 lines');
  if (Array.isArray(about.lead)) about.lead.forEach((line, i) => {
    if (line?.length > 60) errors.push(`about.lead[${i}]: must be ≤ 60 characters`);
  });
  if (!Array.isArray(about.pillars) || about.pillars.length < 3 || about.pillars.length > 4) errors.push('about.pillars: expected 3–4 items');
  const stackPatterns = (Array.isArray(c.skills) ? c.skills : []).flatMap(s => Array.isArray(s?.items) ? s.items : []).filter(item => typeof item === 'string' && item).map(item => new RegExp('(?<![A-Za-z0-9])' + item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9])', 'i'));
  if (Array.isArray(about.pillars)) about.pillars.forEach((pillar, i) => {
    const path = `about.pillars[${i}]`;
    pillar = strings(pillar, 'title text', path);
    if (!hasIcon(pillar.icon)) errors.push(`${path}.icon: unknown icon`);
    if (pillar.title?.length > 24) errors.push(`${path}.title: must be ≤ 24 characters`);
    if (pillar.text?.length > 120) errors.push(`${path}.text: must be ≤ 120 characters`);
    if (typeof pillar.text === 'string') {
      if ((Array.isArray(c.stats) ? c.stats : []).some(s => typeof s?.value === 'string' && pillar.text.includes(s.value))) errors.push(`${path}.text: repeats a hero stat`);
      if (stackPatterns.some(pattern => pattern.test(pillar.text))) errors.push(`${path}.text: repeats a Stack item`);
    }
  });
  if (!Array.isArray(about.companies) || about.companies.length < 6 || about.companies.length > 16) errors.push('about.companies: expected 6–16 items');
  const companies = new Set();
  if (Array.isArray(about.companies)) about.companies.forEach((name, i) => {
    if (typeof name !== 'string' || !name.trim()) { errors.push(`about.companies[${i}]: required non-empty string`); return; }
    const normalized = name.toLowerCase();
    if (companies.has(normalized)) errors.push(`about.companies: duplicate "${name}"`);
    companies.add(normalized);
    if (!(Array.isArray(c.experience) ? c.experience : []).some(e => typeof e?.org === 'string' && e.org.toLowerCase().includes(normalized))) errors.push(`about.companies[${i}]: not found in experience`);
  });
  for (const key of ['paragraphs', 'factsLabel']) if (Object.hasOwn(about, key)) errors.push('about.paragraphs: removed, use lead/intro/pillars');
  strings(c.sections, 'skills timeline services process', 'sections');
  const timelineIntro = strings(c.timelineIntro, 'title lead linkLabel', 'timelineIntro');
  strings(timelineIntro.kindLabels, 'company client open-source milestone', 'timelineIntro.kindLabels');
  let previousYear;
  array(c.timeline, 'timeline').forEach((item, i) => {
    const path = `timeline[${i}]`;
    item = strings(item, 'title text', path);
    if (!['company', 'client', 'open-source', 'milestone'].includes(item.kind)) errors.push(`${path}.kind: invalid kind`);
    if (!(Number.isInteger(item.year) && item.year >= 1990 && item.year <= 2100) &&
        !(typeof item.year === 'string' && /^\d{4}(\s?[–-]\s?(\d{4}|now|present))?$/i.test(item.year))) errors.push(`${path}.year: invalid year`);
    if (item.link !== undefined) {
      if (typeof item.link === 'string') protocol(item.link, /^https:\/\//, `${path}.link`);
      else {
        const link = strings(item.link, 'label', `${path}.link`);
        protocol(link.href, /^https:\/\//, `${path}.link.href`);
      }
    }
    const year = Number(String(item.year).slice(0, 4));
    if (year < previousYear) warnings.push(`timeline: years out of order at [${i}]`);
    previousYear = year;
  });
  strings(c.a11y, 'newTab', 'a11y');
  strings(c.contact, 'title lead email emailLabel copyLabel copiedLabel mailAppLabel website websiteLabel github githubLabel linkedin linkedinLabel location', 'contact');
  const nf = strings(c.notFound, 'title code message', 'notFound'); strings(nf.cta, 'label href', 'notFound.cta');
  strings(c.projectPage, 'breadcrumbLabel homeLabel workLabel highlightsTitle stackTitle yearLabel typeLabel categoryLabel pagerLabel prevLabel nextLabel backLabel caseStudyLink openSourceLink', 'projectPage');
  const intro = strings(c.projectsIntro, 'title lead filterLabel allLabel repoLinkLabel privateNote emptyState kindFilterLabel countSingular countPlural resetLabel roleLabel stackLabel', 'projectsIntro');
  strings(intro.kindLabels, 'case-study open-source', 'projectsIntro.kindLabels');
  array(c.skills, 'skills').forEach((s, i) => { s = strings(s, 'group', `skills[${i}]`); stringArray(s.items, `skills[${i}].items`); });
  for (const [key, fields] of [['services', 'title desc'], ['process', 'step desc']]) array(c[key], key).forEach((v, i) => strings(v, fields, `${key}[${i}]`));
  array(c.experience, 'experience').forEach((entry, i) => {
    const path = `experience[${i}]`;
    entry = strings(entry, 'org location type', path);
    if (entry.orgUrl !== undefined) protocol(entry.orgUrl, /^https:\/\//, `${path}.orgUrl`);
    array(entry.roles, `${path}.roles`).forEach((role, j) => {
      const rp = `${path}.roles[${j}]`;
      role = strings(role, 'title start', rp);
      const month = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!month.test(role.start ?? '')) errors.push(`${rp}.start: expected YYYY-MM with valid month`);
      if (role.end !== null && (typeof role.end !== 'string' || !month.test(role.end))) errors.push(`${rp}.end: expected YYYY-MM with valid month or null`);
      if (month.test(role.start) && month.test(role.end) && role.end < role.start) errors.push(`${rp}.end: must be >= start`);
      stringArray(role.highlights, `${rp}.highlights`);
      if (Array.isArray(role.highlights) && role.highlights.length > 3) errors.push(`${rp}.highlights: expected 1–3 items`);
    });
  });
  if (c.stats !== undefined) array(c.stats, 'stats', false).forEach((s, i) => strings(s, 'value label', `stats[${i}]`));
  const categories = array(c.categories, 'categories'); stringArray(c.categories, 'categories');
  if (new Set(categories).size !== categories.length) errors.push('categories: must be unique');
  const ids = new Set();
  array(c.projects, 'projects').forEach((p, i) => {
    const path = `projects[${i}]`;
    p = strings(p, 'id name kind category summary role', path);
    if (!/^[a-z0-9-]+$/.test(p.id ?? '')) errors.push(`${path}.id: invalid id`);
    if (ids.has(p.id)) errors.push(`${path}.id: duplicate id`); ids.add(p.id);
    if (!['case-study', 'open-source'].includes(p.kind)) errors.push(`${path}.kind: invalid kind`);
    if (!categories.includes(p.category)) errors.push(`${path}.category: not in categories`);
    for (const k of ['highlights', 'stack']) stringArray(p[k], `${path}.${k}`);
    if (p.year !== undefined && (!Number.isInteger(p.year) || p.year < 1990 || p.year > 2100)) errors.push(`${path}.year: expected integer 1990–2100`);
    if (typeof p.featured !== 'boolean') errors.push(`${path}.featured: expected boolean`);
    if (p.kind === 'open-source' && (typeof p.repoUrl !== 'string' || !/^https:\/\/github\.com\/TPCT\/[A-Za-z0-9._-]+$/.test(p.repoUrl))) errors.push(`${path}.repoUrl: required TPCT GitHub repository URL`);
    if (p.repoUrl !== undefined) protocol(p.repoUrl, /^https:\/\//, `${path}.repoUrl`);
    if (p.kind === 'case-study' && p.repoUrl !== undefined) warnings.push(`${path}.repoUrl: ignored for case study`);
  });
  return { errors, warnings };
}
